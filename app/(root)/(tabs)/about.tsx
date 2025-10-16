import { Text, View, StyleSheet, Pressable } from "react-native";

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>About screen</Text>

      <View className="flex flex-row flex-wrap gap-4 p-3 rounded-md bg-slate-50">
        
      <Pressable
        className="p-4 bg-teal-500 rounded-md transition-all duration-200 ease-in-out active:bg-teal-700 active:scale-95"
        >
        <Text className="text-lg font-semibold text-white">Press Me</Text>
      </Pressable>
      </View>        
        
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
});
