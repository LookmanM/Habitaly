import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

console.log('[Supabase] URL loaded:', supabaseUrl ? supabaseUrl.slice(0, 30) + '...' : 'MISSING ⚠️');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    // Force React Native's native fetch — prevents the whatwg-fetch polyfill
    // from being used, which causes "Network request failed" on device.
    fetch: fetch.bind(globalThis),
  },
});
