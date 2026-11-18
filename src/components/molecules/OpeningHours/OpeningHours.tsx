import { Text, View } from "react-native";

import {
  WEEKDAYS,
  type OpeningHours as OpeningHoursModel,
  type TimeRange,
  type Weekday,
} from "@/domain/stores/StoresModel";
import { styles } from "./styles";

const DAY_LABELS: Record<Weekday, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

const CLOSED_LABEL = "Fermé";

const formatRanges = (ranges: readonly TimeRange[]): string =>
  ranges.length === 0
    ? CLOSED_LABEL
    : ranges.map(({ open, close }) => `${open} - ${close}`).join(", ");

type OpeningHoursProps = {
  openingHours: OpeningHoursModel;
};

export const OpeningHours = ({ openingHours }: OpeningHoursProps) => (
  <View testID="opening-hours" style={styles.container}>
    <Text style={styles.title}>Horaires</Text>
    {WEEKDAYS.map((day) => (
      <View key={day} testID={`opening-hours-${day}`} style={styles.row}>
        <Text style={styles.day}>{DAY_LABELS[day]}</Text>
        <Text style={styles.hours}>{formatRanges(openingHours[day])}</Text>
      </View>
    ))}
  </View>
);
