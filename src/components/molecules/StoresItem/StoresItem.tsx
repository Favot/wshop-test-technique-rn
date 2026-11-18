import type { StoresModel } from "@/domain/stores/StoresModel";
import { Image } from "expo-image";
import { memo } from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";

type StoresItemProps = {
  store: StoresModel;
};

export const StoresItem = memo(function StoresItem({ store }: StoresItemProps) {
  return (
    <View style={styles.container}>
      <Image
        testID={`store-image-${store.id}`}
        source={{ uri: store.imageUrl }}
        style={styles.image}
      />
      <Text style={styles.text}>{store.name}</Text>
      <Text style={styles.text}>{store.address}</Text>
      <Text style={styles.text}>{store.phone}</Text>
    </View>
  );
});
