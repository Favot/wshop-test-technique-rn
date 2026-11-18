import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 8,
    gap: 16,
  },
  listContent: {
    gap: 16,
  },
  emptyContainer: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});
