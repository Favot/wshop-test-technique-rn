import { OpeningHours, StoreMap } from "@/components/molecules";
import { getServiceRegistry } from "@/gateway/serviceRegistry";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Button,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./style";

const SAFE_AREA_EDGES: Edge[] = ["left", "right", "bottom"];

type StoreDetailPageProps = {
  id: string;
};

export const StoreDetailPage = ({ id }: StoreDetailPageProps) => {
  const {
    data: store,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["store", id],
    queryFn: () => getServiceRegistry().storesService.fetchStoreById(id),
  });

  const queryClient = useQueryClient();
  const favoriteQueryKey = ["favorite", id];

  const { data: isFavorite = false } = useQuery({
    queryKey: favoriteQueryKey,
    queryFn: () => getServiceRegistry().storesService.isFavorite(id),
  });

  const { mutate: toggleFavorite } = useMutation({
    mutationFn: () => getServiceRegistry().storesService.toggleFavorite(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: favoriteQueryKey }),
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={SAFE_AREA_EDGES}>
      {isPending ? (
        <View style={styles.center}>
          <ActivityIndicator testID="loader" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text testID="error" style={styles.text}>
            Impossible de charger ce magasin.
          </Text>
          <Button
            testID="retry-button"
            title="Réessayer"
            onPress={() => void refetch()}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <Image
            testID={`store-image-${store.id}`}
            source={{ uri: store.imageUrl }}
            style={styles.image}
          />
          <Text style={styles.name}>{store.name}</Text>
          <Pressable
            testID="favorite-button"
            accessibilityRole="button"
            accessibilityState={{ selected: isFavorite }}
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive,
            ]}
            onPress={() => toggleFavorite()}
          >
            <Text
              style={[
                styles.favoriteButtonText,
                isFavorite && styles.favoriteButtonTextActive,
              ]}
            >
              Favori
            </Text>
          </Pressable>
          <Text style={styles.text}>{store.address}</Text>
          <Text style={styles.text}>{store.phone}</Text>
          <OpeningHours openingHours={store.openingHours} />
          <StoreMap name={store.name} location={store.location} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
