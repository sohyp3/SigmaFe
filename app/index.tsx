import { View, Text } from "react-native";
import React from "react";
import { Redirect } from "expo-router";

const Index = () => {
  // const { authState } = useAuth();
  // if (authState?.authenticated === null) {
  //   return null;
  // }
  return (
  <Redirect href={"/(auth)/sign-in"} />
  );
};

export default Index;
