// ─── Supabase Client (INACTIVE) ──────────────────────────────────────────────
// La plantilla usa Firebase por defecto. Para cambiar a Supabase:
// 1. Instalar: pnpm add @supabase/supabase-js
// 2. Descomentar el código de abajo
// 3. En store/useAuthStore.ts, reemplazar las llamadas de Firebase por las
//    equivalentes de Supabase exportadas desde este archivo
// 4. Agregar las env vars EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY
// ─────────────────────────────────────────────────────────────────────────────

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { createClient } from '@supabase/supabase-js';
// import { Platform } from 'react-native';
//
// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
//
// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: Platform.OS === 'web' ? undefined : AsyncStorage,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: Platform.OS === 'web',
//   },
// });

export {};
