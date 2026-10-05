import TrafficSignsList from "@/components/More/TrafficSignList";
import { useQueryTrafficSigns } from "@/hooks/category/useTrafficSignsQuery";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function Signs() {
  const { trafficSigns, isLoading, pagination, error } = useQueryTrafficSigns();
  console.log("traffic signs", trafficSigns);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {isLoading ? (
        <View>
          <Text>Loading...</Text>
        </View>
      ) : error ? (
        <View>
          <Text>Error occurred while fetching traffic signs.</Text>
        </View>
      ) : (
        <TrafficSignsList initialData={trafficSigns} />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
