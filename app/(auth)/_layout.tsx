import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const Layout = () => {
return(
    <>
    <Stack>
        <Stack.Screen name="index" options={{headerShown:false}}/>
        <Stack.Screen name="sign-up" options={{headerShown:false}}/>
    </Stack>
    <StatusBar
        style="light"
    backgroundColor="#161622"
    />
    </>
)
};

export default Layout;
