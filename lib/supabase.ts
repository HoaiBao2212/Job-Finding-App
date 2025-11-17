// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

// Nhận diện đang chạy trong React Native hay không
const isReactNative =
  typeof navigator !== "undefined" && navigator.product === "ReactNative";

let supabaseClient;

if (isReactNative) {
  // Chỉ require AsyncStorage khi đang chạy trong app React Native
  const AsyncStorage =
    require("@react-native-async-storage/async-storage").default;

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} else {
  // Khi đang chạy trong Node (CLI, build, v.v.) thì KHÔNG dùng AsyncStorage
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = supabaseClient;
