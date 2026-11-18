import { useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

const ITEM_HEIGHT = 100;

export const ProductList = ({ products }: { products: Product[] }) => {
  const [filter, setFilter] = useState("");

  const filteredProducts = useMemo(
    () => products.filter((p) => p.name.includes(filter)),
    [products, filter],
  );

  return (
    <FlatList
      data={filteredProducts}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => <ProductItem product={item} />}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={7}
      onEndReached={() => console.log("end")}
      getItemLayout={getItemLayout}
    />
  );
};

const ProductItem = ({ product }: { product: Product }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price} €</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

const keyExtractor = (item: Product): string => item.id;

const getItemLayout = (
  _data: ArrayLike<Product> | null | undefined,
  index: number,
) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});
