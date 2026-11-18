import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  ListRenderItemInfo,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StoresItem } from "@/components/molecules";
import type { StoresModel } from "@/domain/stores/StoresModel";
import { getServiceRegistry } from "@/gateway/serviceRegistry";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { styles } from "./style";

const SEARCH_DEBOUNCE_MS = 300;

const keyExtractor = (store: StoresModel): string => store.id;

const renderItem = ({ item }: ListRenderItemInfo<StoresModel>) => (
  <StoresItem store={item} />
);

export const HomePage = () => {
  const [name, setName] = useState("");
  const debouncedName = useDebouncedValue(name, SEARCH_DEBOUNCE_MS);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["stores", debouncedName],
    queryFn: ({ pageParam }) =>
      getServiceRegistry().storesService.fetchStores(debouncedName, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    placeholderData: keepPreviousData,
  });

  const stores = useMemo(
    () => data?.pages.flatMap((page) => page.stores),
    [data],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage({ cancelRefetch: false });
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        ) : isError && !data ? (
          <View style={styles.errorContainer} testID="error-state">
            <Text style={styles.errorText}>
              Impossible de charger les magasins.
            </Text>
            <Button
              testID="retry-button"
              title="Réessayer"
              onPress={() => void refetch()}
            />
          </View>
        ) : (
          <FlatList
            testID="store-list"
            data={stores}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator testID="next-page-loader" />
              ) : undefined
            }
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
