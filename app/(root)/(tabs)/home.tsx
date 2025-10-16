import axios from "axios";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Home() {
  const [username, setUsername] = React.useState("");
  React.useEffect(() => {
    axios.get(`${process.env.EXPO_PUBLIC_API_URL}user/username`).then((res) => {
      setUsername(res.data.username);
    });
  }, []);
// console.log(`hehe\n\n ${axios.defaults.headers.common["Authorization"]}`)

  return (
    <View style={styles.container}>
      <Text>Home Screen (Empty)</Text>
    <Text>{username}</Text>
    </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
