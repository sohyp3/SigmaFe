import { Stack } from "expo-router";
import "../global.css";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Text } from "react-native";
import React from "react";

export default function RootLayout() {
  const { authState, onLogout } = useAuth();

  return (
    <>
      <AuthProvider>
        <Stack>
          {/* {authState?.authenticated ? (

            <Stack.Screen name="(tabs)" options={{ headerShown: false , headerRight:()=>(<button onClick={onLogout}>Logout</button>)}} />

          ) : (
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          )} */}
          <Stack.Screen name="+not-found" />
        </Stack>

        <StatusBar style="light" />
      </AuthProvider>
    </>
  );
}
