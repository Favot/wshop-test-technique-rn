import { makeStoreDto, makeStoreModel } from "./storeDto.fixture";
import { toStoresModel } from "./storeMapper";

describe("toStoresModel", () => {
  it("nests the flat latitude / longitude into a location object", () => {
    expect(toStoresModel(makeStoreDto()).location).toEqual({
      latitude: 48.8674,
      longitude: 2.3636,
    });
  });

  it("removes the flat latitude / longitude fields", () => {
    const store = toStoresModel(makeStoreDto());

    expect(store).not.toHaveProperty("latitude");
    expect(store).not.toHaveProperty("longitude");
  });

  it("keeps every other field untouched", () => {
    expect(toStoresModel(makeStoreDto("7"))).toEqual(makeStoreModel("7"));
  });
});
