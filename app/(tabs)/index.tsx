import { Text, Platform, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex items-center justify-center flex-1">
      <View>
        <Text>WOrkie</Text>
      </View>
      <View>
        {
          Platform.OS === 'web' && (
            <Text>Weeb</Text>
          )
        }

        {
          (Platform.OS === 'android' || Platform.OS === 'ios') && (
            <Text>fone?</Text>
          )
        }
        </View>
    </View>
  );
}
