import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { getServiceRegistry } from "@/gateway/serviceRegistry";

export const HomePage = () => {
  const { data: stores, isPending } = useQuery({
    queryKey: ["stores"],
    queryFn: () => getServiceRegistry().storesService.fetchStores(),
  });

  if (isPending) {
    return <ActivityIndicator testID="loader" />;
  }

  return (
    <View>
      <FlatList
        testID="store-list"
        data={stores}
        keyExtractor={(store) => store.id}
        renderItem={({ item }) => <Text>{item.name}</Text>}
      />
    </View>
  );
};
