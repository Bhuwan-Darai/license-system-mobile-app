# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm start` (`expo start`) — dev server; `npm run android` / `ios` / `web` start for a specific platform
- `npm run lint` (`expo lint`, ESLint flat config with `eslint-config-expo`)
- Type-check: `npx tsc --noEmit` (strict mode; `@/*` maps to the repo root)
- There is no test runner configured. `npm run reset-project` is the Expo starter script — don't run it.

Expo SDK 54 / React Native 0.81 / React 19 / expo-router 6 (file-based routing). Per AGENTS.md, consult the v54 Expo docs before writing Expo code.

## Architecture

Mobile client for a driving-license app (practice tests, license info, services, utilities). Source lives at the repo root (no `src/`); `app/` is the expo-router tree.

**API layer** — `axios.ts` exports a single axios instance (`baseURL = ${API_URL}/api/v1`) whose response interceptor returns `response.data` directly (callers get the body, not an AxiosResponse) and shows `Alert`s globally for 401/403/404/422/429/5xx and network errors. Auth is a cookie: the `auth_token` is extracted from `set-cookie`, stored in AsyncStorage, and re-sent manually as a `Cookie` header on native; on web the browser handles the httpOnly cookie (`withCredentials`). Because errors already alert, hooks/screens usually shouldn't alert again.

**Backend URL** — `constants.ts` currently hardcodes a LAN IP (`LOCAL_BACKEND_IP`) and ignores `.env`'s `EXPO_PUBLIC_API_URL`. Update the IP there when switching networks/devices.

**Data hooks** — server data goes through TanStack Query hooks in `hooks/<domain>/` (`category`, `practice`, `mobile`, `notifications`, `service`), each defining its own response interfaces next to the `useQuery`/`useMutation`. Endpoints under `/mobile/...` are the mobile-specific API routes.

**Auth** — `context/auth.tsx` (`AuthProvider` / `useAuth`) holds user + status (`unauthenticated | otp-pending | authenticated | guest`) and the login/OTP/signup/signout flows. `app/_layout.tsx` wraps the app in `QueryClientProvider` → `AuthProvider` → `PushRegistration`. `app/(tabs)/_layout.tsx` guards the tabs by redirecting to `/login` when there is no `user`.

**Routing** — Root `Stack` (`index`, `login`, `(tabs)`) plus nested stacks per feature folder: `app/more/*` (utilities, policies, license status/registration, inquiry, calculators), `app/practice/*` (quiz/mcq/attempt/history), `app/service/*` (bike, fuel, service logs). New screens in these folders must also be registered in that folder's `_layout.tsx` to get a title; shared stack options are in `constants/navigation.tsx`. Tabs: home, category, practice, news, service, more.

**Local-only state** — Zustand stores: `store/store.ts` (email for OTP flow) and `hooks/service/useBikeStore.ts` (bike/fuel/service records persisted to AsyncStorage via `persist`; never synced to the backend, bill photos kept as file URIs in the app document directory).

**Push notifications** — `components/PushRegistration.tsx`, `hooks/notifications/*`, `utils/push.ts` (device registration/unregistration with the backend, invoked from `signOut` in the auth context).

**Theming** — use `BrandColors` from `constants/theme.ts` for colors rather than literals.
