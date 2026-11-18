import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 16,
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
  favoriteButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#208AEF",
    backgroundColor: "white",
  },
  favoriteButtonActive: {
    backgroundColor: "#208AEF",
  },
  favoriteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#208AEF",
  },
  favoriteButtonTextActive: {
    color: "white",
  },
});
