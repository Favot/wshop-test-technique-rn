import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StoreList } from "@/components/organisms";
import { getServiceRegistry } from "@/gateway/serviceRegistry";
import { styles } from "./style";

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

  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isPending, refetch } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => getServiceRegistry().storesService.fetchFavorites(),
    placeholderData: keepPreviousData,
  });

  const stores = useMemo(() => {
    const search = name.trim().toLowerCase();
    if (!search) {
      return data;
    }
    return data?.filter((store) => store.name.toLowerCase().includes(search));
  }, [data, name]);

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
