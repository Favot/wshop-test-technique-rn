import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StoresItem } from "@/components/molecules";
import { getServiceRegistry } from "@/gateway/serviceRegistry";

export const HomePage = () => {
  const [name, setName] = useState("");

  const {
    data: stores,
    isPending,
    error,
    isError,
  } = useQuery({
    queryKey: ["stores", name],
    queryFn: () => getServiceRegistry().storesService.fetchStores(name),
    placeholderData: keepPreviousData,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TextInput
          testID="search-input"
          placeholder="Rechercher un magasin"
          value={name}
          onChangeText={setName}
          style={styles.searchInput}
        />
        {isPending ? (
          <ActivityIndicator testID="loader" />
        ) : (
          <FlatList
            testID="store-list"
            data={stores}
            keyExtractor={(store) => store.id}
            renderItem={({ item }) => <StoresItem store={item} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    minHeight: 40,
  },
});
