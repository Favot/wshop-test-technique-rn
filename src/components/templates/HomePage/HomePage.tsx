import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  View,
} from "react-native";

import { getServiceRegistry } from "@/gateway/serviceRegistry";

export const HomePage = () => {
  const [name, setName] = useState("");

  const { data: stores, isPending } = useQuery({
    queryKey: ["stores", name],
    queryFn: () => getServiceRegistry().storesService.fetchStores(name),
    placeholderData: keepPreviousData,
  });

  return (
    <View>
      <TextInput
        testID="search-input"
        placeholder="Rechercher un magasin"
        value={name}
        onChangeText={setName}
      />
      {isPending ? (
        <ActivityIndicator testID="loader" />
      ) : (
        <FlatList
          testID="store-list"
          data={stores}
          keyExtractor={(store) => store.id}
          renderItem={({ item }) => <Text>{item.name}</Text>}
        />
      )}
    </View>
  );
};
