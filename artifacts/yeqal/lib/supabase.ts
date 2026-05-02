import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

declare const process: { env: Record<string, string | undefined> };

const SUPABASE_URL: string =
  (typeof process !== "undefined" && process.env.EXPO_PUBLIC_SUPABASE_URL) ||
  "https://cfpcxikjhxzymrplrimm.supabase.co";

const SUPABASE_ANON_KEY: string =
  (typeof process !== "undefined" && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) ||
  "sb_publishable_3-1H8UG5TWhOLFtNL5wxSg_78DrWACW";

export const isSupabaseConfigured = !!(
  SUPABASE_URL &&
  SUPABASE_URL.startsWith("http") &&
  SUPABASE_ANON_KEY &&
  SUPABASE_ANON_KEY.length > 10
);

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (_client) return _client;
  try {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        storage: AsyncStorage,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
    return _client;
  } catch {
    return null;
  }
}

export const supabase: SupabaseClient | null = (() => {
  try {
    return getClient();
  } catch {
    return null;
  }
})();
