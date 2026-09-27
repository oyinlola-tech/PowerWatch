import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// Tokens live in the OS keychain/keystore; SecureStore has no web support, so web
// falls back to AsyncStorage.
const secure = Platform.OS !== "web";

const read = (key: string) => (secure ? SecureStore.getItemAsync(key) : AsyncStorage.getItem(key));
const write = (key: string, value: string) =>
  secure ? SecureStore.setItemAsync(key, value) : AsyncStorage.setItem(key, value);
const remove = (key: string) => (secure ? SecureStore.deleteItemAsync(key) : AsyncStorage.removeItem(key));

const ACCESS = "pw.accessToken";
const REFRESH = "pw.refreshToken";
const PUSH = "pw.expoPushToken";
const USER_CACHE = "pw.userCache";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export const tokenStore = {
  getAccess: () => read(ACCESS),
  getRefresh: () => read(REFRESH),
  async save(tokens: SessionTokens) {
    await Promise.all([write(ACCESS, tokens.accessToken), write(REFRESH, tokens.refreshToken)]);
  },
  async clear() {
    await Promise.all([remove(ACCESS), remove(REFRESH), AsyncStorage.removeItem(USER_CACHE)]);
  },
};

export const pushTokenStore = {
  get: () => read(PUSH),
  set: (token: string) => write(PUSH, token),
  clear: () => remove(PUSH),
};

/** Last known profile, so the app opens offline instead of signing the user out. */
export const userCache = {
  async get<T>(): Promise<T | null> {
    const raw = await AsyncStorage.getItem(USER_CACHE);
    try {
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set: (user: unknown) => AsyncStorage.setItem(USER_CACHE, JSON.stringify(user)),
};
