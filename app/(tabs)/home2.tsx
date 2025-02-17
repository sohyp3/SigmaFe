import { Text, Platform, View, Touchable, Pressable } from "react-native";
import { useColorScheme } from "nativewind";

export default function HomeScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  return (
    <View className="flex flex-1 justify-center items-center text-black bg-slate-200 dark:bg-red-900 dark:text-gray-50">
      <View className="">
        <Text className="text-purple-500 dark:text-white">WOrkie</Text>
      </View>
      <View>
        {Platform.OS === "web" && <Text>Weeb</Text>}

        {(Platform.OS === "android" || Platform.OS === "ios") && (
          <Text>fone?</Text>
        )}
      </View>

      <View>
        <Text
          onPress={() =>
            setColorScheme(colorScheme === "light" ? "dark" : "light")
          }
        >
          {`The color scheme is ${colorScheme}`}
        </Text>

        {/* <Pressable
          onPress={() =>
            setColorScheme(colorScheme === "light" ? "dark" : "light")
          }
          className="p-4 bg-teal-500 rounded-md transition-all duration-200 ease-in-out active:bg-teal-700 active:scale-95"
        >
          <Text>Change Color Scheeme to {colorScheme}</Text>
        </Pressable> */}
      </View>
    </View>
  );
}
