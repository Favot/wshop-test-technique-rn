import type { StoreCoordinates } from "@/domain/stores/StoresModel";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { Platform, Text } from "react-native";
import { styles } from "./styles";

const ZOOM = 15;

type StoreMapProps = {
  name: string;
  location: StoreCoordinates;
};

export const StoreMap = ({ name, location }: StoreMapProps) => {
  const cameraPosition = { coordinates: location, zoom: ZOOM };
  const markers = [{ coordinates: location, title: name }];

  if (Platform.OS === "ios") {
    return (
      <AppleMaps.View
        style={styles.map}
        cameraPosition={cameraPosition}
        markers={markers}
      />
    );
  }

  if (Platform.OS === "android") {
    return (
      <GoogleMaps.View
        style={styles.map}
        cameraPosition={cameraPosition}
        markers={markers}
      />
    );
  }

  return (
    <Text style={styles.fallback}>{"La carte n'est pas disponible."}</Text>
  );
};
