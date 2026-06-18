# base-expo-app

## Descripción del proyecto

Plantilla móvil en **Expo ~52** con Expo Router, NativeWind, Zustand, React Hook Form + Zod y **Firebase** para autenticación (email/password, Google, Apple) y persistencia.

## Problema que resuelve

Acelera el arranque de apps React Native con navegación por archivos, estilos utilitarios, dark mode funcional, manejo de teclado y auth completa ya alineados, en lugar de configurar todo a mano en cada repositorio.

## Stack

- Expo ~52, Expo Router, React Native (New Architecture)
- Firebase Auth + Firestore + Storage
- NativeWind / Tailwind CSS (dark mode con CSS vars)
- react-native-keyboard-controller
- react-native-reanimated (animaciones de pantalla)
- Zustand, React Hook Form + Zod

## Requisitos

- Node.js LTS
- pnpm
- Para correr en dispositivo/simulador: **dev client** (no funciona en Expo Go por los módulos nativos de Google/Apple sign-in)

## Instalación

```bash
pnpm install
```

Scripts: `pnpm start`, `pnpm android`, `pnpm ios`, `pnpm web`.

> **Nota**: Los scripts `android` e `ios` usan `expo run:*` y requieren `expo prebuild` previo (ver Setup nativo más abajo).

## Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá las claves:

```bash
cp .env.local.example .env.local
```

## Personalizar

Si clonás esta plantilla para otro producto, actualizá en `app.config.ts`:
- `name`, `slug`, `scheme`
- `bundleIdentifier` (iOS) y `package` (Android)
- `iosUrlScheme` en el plugin de Google Sign-In (REVERSED_CLIENT_ID)

## Setup nativo (obligatorio)

Google Sign-In y Sign in with Apple son módulos nativos — **no corren en Expo Go**.

### 1. Firebase

1. Creá un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Habilitá **Authentication** → Email/Password + Google + Apple.
3. Completá las vars `EXPO_PUBLIC_FIREBASE_*` en `.env.local`.

### 2. Google Sign-In

1. En Firebase Console → Authentication → Sign-in method → Google: copiá el **Web client ID** → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
2. Descargá `GoogleService-Info.plist` (iOS) y `google-services.json` (Android) y ponelos en la raíz del proyecto.
3. Del `GoogleService-Info.plist` copiá el valor de `CLIENT_ID` → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.
4. En `app.config.ts` actualizá el `iosUrlScheme` con el `REVERSED_CLIENT_ID` del mismo archivo.

### 3. Sign in with Apple

1. En tu Apple Developer Account, habilitá el capability **Sign in with Apple** para tu App ID.
2. En `app.config.ts` asegurate de que `ios.usesAppleSignIn: true` esté activo (viene habilitado por defecto).
3. Si usás una cuenta personal de Apple (sin Developer Program), comentá `usesAppleSignIn` temporalmente para poder firmar y reactivalo antes del submit.

### 4. Prebuild y build

```bash
# Generar código nativo
npx expo prebuild

# Correr en simulador / dispositivo
npx expo run:ios
npx expo run:android
```

O con EAS Build:

```bash
eas build --platform ios --profile development
eas build --platform android --profile development
```

### 5. EAS (push notifications)

Añadí el ID de tu proyecto EAS en `.env.local` → `EXPO_PUBLIC_EAS_PROJECT_ID`.  
Podés encontrarlo en `expo.dev → tu proyecto → settings`.

## Supabase (alternativa)

Si preferís Supabase en lugar de Firebase, ver `lib/supabase.ts` para las instrucciones de activación.
