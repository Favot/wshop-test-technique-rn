import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  TextInput,
  View,
} from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

import { StoresItem } from "@/components/molecules";
import type { StoresModel } from "@/domain/stores/StoresModel";
import { getServiceRegistry } from "@/gateway/serviceRegistry";
import { styles } from "./style";

// The stack header already handles the top inset.
const SAFE_AREA_EDGES: Edge[] = ["left", "right", "bottom"];

const keyExtractor = (store: StoresModel): string => store.id;

const renderItem = ({ item }: ListRenderItemInfo<StoresModel>) => (
  <StoresItem store={item} />
);

export const HomePage = () => {
  const [name, setName] = useState("");

  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data,
    isPending,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["stores", name],
    queryFn: ({ pageParam }) =>
      getServiceRegistry().storesService.fetchStores(name, pageParam),
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
    <SafeAreaView style={styles.safeArea} edges={SAFE_AREA_EDGES}>
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
