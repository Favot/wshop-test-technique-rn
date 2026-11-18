import { StoreMap } from "@/components/molecules";
import { getServiceRegistry } from "@/gateway/serviceRegistry";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./style";

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
    <SafeAreaView style={styles.safeArea}>
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
        <View style={styles.container}>
          <Image
            testID={`store-image-${store.id}`}
            source={{ uri: store.imageUrl }}
            style={styles.image}
          />
          <Text style={styles.name}>{store.name}</Text>
          <Text style={styles.text}>{store.address}</Text>
          <Text style={styles.text}>{store.phone}</Text>
          <StoreMap name={store.name} location={store.location} />
        </View>
      )}
    </SafeAreaView>
  );
};
