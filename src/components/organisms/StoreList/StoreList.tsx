import { memo } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  type FlatListProps,
} from "react-native";

import { StoresItem } from "@/components/molecules";
import type { StoresModel } from "@/domain/stores/StoresModel";
import { styles } from "./styles";

type StoreListProps = {
  stores: StoresModel[] | undefined;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  isFetchingNextPage?: boolean;
  ListEmptyComponent?: FlatListProps<StoresModel>["ListEmptyComponent"];
};

const keyExtractor = (store: StoresModel): string => store.id;

const renderItem = ({ item }: ListRenderItemInfo<StoresModel>) => (
  <StoresItem store={item} />
);

export const StoreList = memo(function StoreList({
  stores,
  isRefreshing = false,
  onRefresh,
  onEndReached,
  isFetchingNextPage = false,
  ListEmptyComponent,
}: StoreListProps) {
  return (
    <FlatList
      testID="store-list"
      data={stores}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      refreshing={onRefresh ? isRefreshing : undefined}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator testID="next-page-loader" />
        ) : undefined
      }
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={7}
      contentContainerStyle={styles.listContent}
    />
  );
});
