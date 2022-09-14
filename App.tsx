import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { LeadingTrimEditor } from "./src/editor";
import { SystemFont } from "./src/fonts";

export default function App() {
  return (
    <View style={styles.container}>
      <LeadingTrimEditor font={SystemFont}></LeadingTrimEditor>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});
