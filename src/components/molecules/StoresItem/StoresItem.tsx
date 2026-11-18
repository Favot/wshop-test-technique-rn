import type { StoresModel } from "@/domain/stores/StoresModel";
import { Image } from "expo-image";
import { router } from "expo-router";
import { memo } from "react";
import { Pressable, Text } from "react-native";
import { styles } from "./styles";

type StoresItemProps = {
  store: StoresModel;
};

export const StoresItem = memo(function StoresItem({ store }: StoresItemProps) {
  return (
    <Pressable
      testID={`store-item-${store.id}`}
      style={styles.container}
      onPress={() =>
        router.push({ pathname: "/stores/[id]", params: { id: store.id } })
      }
    >
      <Image
        testID={`store-image-${store.id}`}
        source={{ uri: store.imageUrl }}
        style={styles.image}
      />
      <Text style={styles.text}>{store.name}</Text>
      <Text style={styles.text}>{store.address}</Text>
      <Text style={styles.text}>{store.phone}</Text>
    </Pressable>
  );
});
