import { OpeningHours, StoreMap } from "@/components/molecules";
import { getServiceRegistry } from "@/gateway/serviceRegistry";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./style";

const SAFE_AREA_EDGES: Edge[] = ["left", "right", "bottom"];

const handleFavoritePress = () => {
  throw new Error("Not implemented yet");
};

type StoreDetailPageProps = {
  id: string;
};

export const StoreDetailPage = ({ id }: StoreDetailPageProps) => {
  const {
    data: store,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["store", id],
    queryFn: () => getServiceRegistry().storesService.fetchStoreById(id),
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
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <Text style={styles.favoriteButtonText}>Favori</Text>
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
