import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { StoresModel } from "@/domain/stores/StoresModel";

type StoresItemProps = {
  store: StoresModel;
};

export const StoresItem = memo(function StoresItem({ store }: StoresItemProps) {
  return (
    <View>
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

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 150,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});
