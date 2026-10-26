# CalConnect Frontend

Expo SDK 58 + Expo Router app (TypeScript strict). Mock data only.

## Running

```
cd frontend
npm install --legacy-peer-deps
npx expo start      # w = web, scan QR with Expo Go for phone
```

## Scripts

- `npm test` runs the Jest suite (`jest`).
- `npm run typecheck` runs `tsc --noEmit`.

All data is mock and resets on reload.

## Testing notes

- **Jest `moduleNameMapper`:** `package.json` maps `react-native/react-private-interface` and `react-native/setup-env` to `node_modules/react-native/src/`. This is a workaround for RN 0.88 + jest-expo. Do not remove it.
- **`jest-env.d.ts`:** provides the `toHavePathname` matcher typings from expo-router.
- **`renderApp`:** `renderApp` in `test-utils/render.tsx` is a plain function that returns renderRouter's promise (tests `await renderApp(...)`). Screen tests import `screen` and `fireEvent` from `expo-router/testing-library`.
- **Installs:** use `--legacy-peer-deps` (Expo SDK 58 / TS 6 peer conflicts).
