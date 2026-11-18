import { StoreDetailPage } from "@/components/templates";
import { useLocalSearchParams } from "expo-router";

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <StoreDetailPage id={id} />;
}
