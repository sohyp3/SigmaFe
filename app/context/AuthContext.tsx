import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

import * as SecureStore from "expo-secure-store";

interface AuthProps {
  authState?: { token: string | null; authenticated: boolean | null };
  onRegister?: (email: string, password: string) => Promise<any>;
  onLogin?: (email: string, password: string) => Promise<any>;
  onLogout?: () => Promise<any>;
}

const TOKEN_KEY = "my-jwt";
export const API_URL = "http://192.168.41.99:8000/api/user/";
const AuthContext = createContext<AuthProps>({});

export const  useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
  const [authState, setAutState] = useState<{
    token: string | null;
    authenticated: boolean | null;
  }>({ token: null, authenticated: null });

  useEffect(() => {
    const getToken = async () => {
      console.log("onstart");
      
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      
      if (token) {
        setAutState({
          token:token,
          authenticated: true,
        });
        axios.defaults.headers.common["Authorization"] =`Bearer ${token}`;
      }
    };
    getToken();
  }, []);



  const register = async (email: string, password: string) => {
    try {
      return await axios.post(`${API_URL}register`, { email, password });
    } catch (error) {
      console.log(error);
    }
  };

  const login = async (email: string, password: string) => {
    
    try {

    console.log("here??");
      const result = await axios.post(`${API_URL}token/`, { email, password });
      console.log(result.data)

      setAutState({
        token: result.data.token,
        authenticated: true,
      })
      axios.defaults.headers.common["Authorization"] = `Bearer ${result.data.token}`;

      await SecureStore.setItemAsync(TOKEN_KEY, result.data.access);

    } catch (error) {
      console.log(error);
    }
  };
  
  const logout= async () => {
    try {
      axios.defaults.headers.common["Authorization"] = ""

      setAutState({
        token: null,
        authenticated: false,
      })
      await SecureStore.deleteItemAsync(TOKEN_KEY)

    } catch (error) {
      console.log(error);
    }
  };

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    authState

  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};