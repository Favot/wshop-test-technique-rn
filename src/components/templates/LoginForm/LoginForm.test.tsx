import { act, render, userEvent, waitFor } from "@testing-library/react-native";

import { LoginForm } from "./LoginForm";

const EMAIL = "john@doe.com";
const PASSWORD = "s3cret!";

const setup = async (onSubmit = jest.fn().mockResolvedValue(undefined)) => {
  const user = userEvent.setup();
  const { findByTestId, findByText, queryByTestId } = await render(
    <LoginForm onSubmit={onSubmit} />,
  );

  const emailInput = await findByTestId("email-input");
  const passwordInput = await findByTestId("password-input");
  const submitButton = await findByTestId("submit-btn");

  const fillCredentials = async () => {
    await user.type(emailInput, EMAIL);
    await user.type(passwordInput, PASSWORD);
  };

  const expectNoLoader = () =>
    waitFor(() => expect(queryByTestId("loader")).not.toBeOnTheScreen());

  const expectNoError = () =>
    waitFor(() => expect(queryByTestId("error-msg")).not.toBeOnTheScreen());

  return {
    user,
    onSubmit,
    emailInput,
    passwordInput,
    submitButton,
    fillCredentials,
    expectNoLoader,
    expectNoError,
    findByTestId,
    findByText,
  };
};

const createDeferred = () => {
  let resolve!: () => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("LoginForm", () => {
  describe("display", () => {
    it("should render the email, password inputs and the submit button", async () => {
      const { emailInput, passwordInput, submitButton, findByText } =
        await setup();

      expect(emailInput).toBeVisible();
      expect(passwordInput).toBeVisible();
      expect(submitButton).toBeVisible();
      expect(await findByText("Connexion")).toBeVisible();
    });

    it("should start with empty fields", async () => {
      const { emailInput, passwordInput } = await setup();

      expect(emailInput).toHaveDisplayValue("");
      expect(passwordInput).toHaveDisplayValue("");
    });

    it("should mask the password", async () => {
      const { passwordInput } = await setup();

      expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it("should not show the error message nor the loader initially", async () => {
      const { expectNoError, expectNoLoader } = await setup();

      await expectNoError();
      await expectNoLoader();
    });
  });

  describe("user interaction", () => {
    describe("empty fields", () => {
      it("should show an error and not submit when both fields are empty", async () => {
        const { user, submitButton, onSubmit, findByTestId, expectNoLoader } =
          await setup();

        await user.press(submitButton);

        expect(await findByTestId("error-msg")).toHaveTextContent(
          "Champs obligatoires",
        );
        expect(onSubmit).not.toHaveBeenCalled();
        await expectNoLoader();
      });

      it("should show an error and not submit when only the email is filled", async () => {
        const { user, emailInput, submitButton, onSubmit, findByTestId } =
          await setup();

        await user.type(emailInput, EMAIL);
        await user.press(submitButton);

        expect(await findByTestId("error-msg")).toHaveTextContent(
          "Champs obligatoires",
        );
        expect(onSubmit).not.toHaveBeenCalled();
      });

      it("should show an error and not submit when only the password is filled", async () => {
        const { user, passwordInput, submitButton, onSubmit, findByTestId } =
          await setup();

        await user.type(passwordInput, PASSWORD);
        await user.press(submitButton);

        expect(await findByTestId("error-msg")).toHaveTextContent(
          "Champs obligatoires",
        );
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    describe("successful submission", () => {
      it("should update the inputs while the user types", async () => {
        const { emailInput, passwordInput, fillCredentials } = await setup();

        await fillCredentials();

        await waitFor(() => {
          expect(emailInput).toHaveDisplayValue(EMAIL);
          expect(passwordInput).toHaveDisplayValue(PASSWORD);
        });
      });

      it("should call onSubmit once with the email and the password", async () => {
        const { user, submitButton, onSubmit, fillCredentials } = await setup();

        await fillCredentials();
        await user.press(submitButton);

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
        expect(onSubmit).toHaveBeenCalledWith(EMAIL, PASSWORD);
      });

      it("should show neither an error nor the loader once the submission is done", async () => {
        const {
          user,
          submitButton,
          fillCredentials,
          expectNoError,
          expectNoLoader,
        } = await setup();

        await fillCredentials();
        await user.press(submitButton);

        await expectNoLoader();
        await expectNoError();
      });
    });

    describe("API error", () => {
      const setupFailing = async () => {
        const onSubmit = jest.fn().mockRejectedValue(new Error("401"));
        const utils = await setup(onSubmit);

        await utils.fillCredentials();
        await utils.user.press(utils.submitButton);

        return utils;
      };

      it("should show the invalid credentials message when onSubmit rejects", async () => {
        const { onSubmit, findByTestId } = await setupFailing();

        expect(await findByTestId("error-msg")).toHaveTextContent(
          "Identifiants incorrects",
        );
        expect(onSubmit).toHaveBeenCalledWith(EMAIL, PASSWORD);
      });

      it("should hide the loader after the failure", async () => {
        const { findByTestId, expectNoLoader } = await setupFailing();

        await findByTestId("error-msg");
        await expectNoLoader();
      });

      it("should keep the typed values so the user can retry", async () => {
        const { emailInput, passwordInput, findByTestId } =
          await setupFailing();

        await findByTestId("error-msg");
        expect(emailInput).toHaveDisplayValue(EMAIL);
        expect(passwordInput).toHaveDisplayValue(PASSWORD);
      });

      it("should allow retrying after a failure", async () => {
        const onSubmit = jest
          .fn()
          .mockRejectedValueOnce(new Error("401"))
          .mockResolvedValueOnce(undefined);
        const {
          user,
          submitButton,
          fillCredentials,
          findByTestId,
          expectNoLoader,
        } = await setup(onSubmit);

        await fillCredentials();
        await user.press(submitButton);
        expect(await findByTestId("error-msg")).toBeVisible();

        await user.press(submitButton);

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
        await expectNoLoader();
      });
    });

    describe("loading state", () => {
      it("should show the loader while the submission is pending", async () => {
        const deferred = createDeferred();
        const onSubmit = jest.fn().mockReturnValue(deferred.promise);
        const {
          user,
          submitButton,
          fillCredentials,
          findByTestId,
          expectNoError,
        } = await setup(onSubmit);

        await fillCredentials();
        await user.press(submitButton);

        expect(await findByTestId("loader")).toBeVisible();
        await expectNoError();

        await act(async () => deferred.resolve());
      });

      it("should hide the loader once the submission resolves", async () => {
        const deferred = createDeferred();
        const onSubmit = jest.fn().mockReturnValue(deferred.promise);
        const {
          user,
          submitButton,
          fillCredentials,
          findByTestId,
          expectNoLoader,
          expectNoError,
        } = await setup(onSubmit);

        await fillCredentials();
        await user.press(submitButton);
        expect(await findByTestId("loader")).toBeVisible();

        await act(async () => deferred.resolve());

        await expectNoLoader();
        await expectNoError();
      });

      it("should hide the loader and show the error once the submission rejects", async () => {
        const deferred = createDeferred();
        const onSubmit = jest.fn().mockReturnValue(deferred.promise);
        const {
          user,
          submitButton,
          fillCredentials,
          findByTestId,
          expectNoLoader,
        } = await setup(onSubmit);

        await fillCredentials();
        await user.press(submitButton);
        expect(await findByTestId("loader")).toBeVisible();

        await act(async () => deferred.reject(new Error("401")));

        expect(await findByTestId("error-msg")).toHaveTextContent(
          "Identifiants incorrects",
        );
        await expectNoLoader();
      });
    });
  });
});
