import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Button, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StoreList } from "@/components/organisms";
import { getServiceRegistry } from "@/gateway/serviceRegistry";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { styles } from "./style";

const SEARCH_DEBOUNCE_MS = 300;

const EmptyFavorites = () => (
  <View testID="empty-favorites" style={styles.emptyContainer}>
    <Text style={styles.emptyTitle}>Aucun favori pour le moment</Text>
    <Text style={styles.emptyText}>
      Ajoutez des magasins à vos favoris pour les retrouver ici.
    </Text>
  </View>
);

export const FavoritePage = () => {
  const [name, setName] = useState("");
  const debouncedName = useDebouncedValue(name, SEARCH_DEBOUNCE_MS);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => getServiceRegistry().storesService.fetchFavorites(),
    placeholderData: keepPreviousData,
  });

  // Tab screens stay mounted, so refetch every time the screen gets focus.
  // The cached favorites stay displayed (and no pull-to-refresh spinner is
  // shown) because `isRefreshing` is only set by a user pull. `cancelRefetch:
  // false` reuses the fetch already in flight on the first focus.
  useFocusEffect(
    useCallback(() => {
      void refetch({ cancelRefetch: false });
    }, [refetch]),
  );

  const stores = useMemo(() => {
    const search = debouncedName.trim().toLowerCase();
    if (!search) {
      return data;
    }
    return data?.filter((store) => store.name.toLowerCase().includes(search));
  }, [data, debouncedName]);

  const hasNoFavorites = data?.length === 0;

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
          placeholder="Rechercher un favori"
          value={name}
          onChangeText={setName}
          style={styles.searchInput}
        />
        {isPending ? (
          <ActivityIndicator testID="loader" />
        ) : isError && !data ? (
          <View style={styles.errorContainer} testID="error-state">
            <Text style={styles.errorText}>
              Impossible de charger les favoris.
            </Text>
            <Button
              testID="retry-button"
              title="Réessayer"
              onPress={() => void refetch()}
            />
          </View>
        ) : (
          <StoreList
            stores={stores}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={hasNoFavorites ? <EmptyFavorites /> : undefined}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
