import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StoresItem } from "@/components/molecules";
import type { StoresModel } from "@/domain/stores/StoresModel";
import { getServiceRegistry } from "@/gateway/serviceRegistry";

const keyExtractor = (store: StoresModel): string => store.id;

const renderItem = ({ item }: ListRenderItemInfo<StoresModel>) => (
  <StoresItem store={item} />
);

export const HomePage = () => {
  const [name, setName] = useState("");

  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: stores,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["stores", name],
    queryFn: () => getServiceRegistry().storesService.fetchStores(name),
    placeholderData: keepPreviousData,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

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
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={7}
            contentContainerStyle={styles.listContent}
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
  listContent: {
    gap: 16,
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
