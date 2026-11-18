import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StoreList } from "@/components/organisms";
import { getServiceRegistry } from "@/gateway/serviceRegistry";
import { styles } from "./style";

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
          <StoreList
            stores={stores}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onEndReached={handleEndReached}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
