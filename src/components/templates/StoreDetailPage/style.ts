import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  text: {
    fontSize: 16,
    color: "black",
  },
});
