import { View, Text, TextInput, Pressable } from "react-native";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const SignIn = () => {
  const { onLogin, onRegister } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const login = async () => {
    
    const result = await onLogin!(email, password);
    console.log(result);
    
    if (result && result.error){
      alert(result.msg)
      console.log(result);
    }
  }

  const register = async () => {
    const result = await onRegister!(email, password);
    if (result && result.error){
      alert(result.msg)
      console.log(result);
    }
    else{
      login()
    }
  }

  return (
    <View className="flex-1 p-4 text-3xl">
      <Text className="text-5xl font-bold">Sign In</Text>
      <Text className="mb-4 text-xl">Enter your email and password</Text>
      <TextInput
        placeholder="Email"
        className="px-4 py-2 mb-4 border-b border-gray-300"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"

        secureTextEntry={true}
        onChangeText={(email:string) => setEmail(email)}
        value={email}
      />
      <TextInput
        placeholder="Password"
        className="px-4 py-2 mb-4 border-b border-gray-300"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={true}
        onChangeText={(password:string) => setPassword(password)}
        value={password}
      />
      <Pressable onPress={login} className="flex items-center p-3 text-center bg-purple-50">
        <Text>Sign in</Text>
      </Pressable>
      <Pressable onPress={() => console.log("Forgot Password")}>
        <Text>Sign Up</Text>
      </Pressable>
      <Pressable onPress={() => console.log("Forgot Password")}>
        <Text>Forgor</Text>
      </Pressable>
    </View>
  );
};

export default SignIn;
