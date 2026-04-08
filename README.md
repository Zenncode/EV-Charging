# My Expo App Scaffold

This project now follows a modular Expo structure with:

- `src/app` route tree scaffold (public/app/admin groups)
- reusable UI/common/form components
- providers (`AppProvider`, `AuthProvider`, `ThemeProvider`, `QueryProvider`)
- backend API integration layer in `src/services/api`
- storage abstractions in `src/services/storage`
- typed domain models in `src/types`
- feature-module folders in `src/features/*`

## Backend API Layer

The API client is implemented in:

- `src/services/api/client.ts`
- `src/services/api/endpoints.ts`
- `src/services/api/auth.api.ts`
- `src/services/api/user.api.ts`
- `src/services/api/product.api.ts`

Environment variables:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_REQUEST_TIMEOUT_MS`

Use `.env.example` as template.

## Scripts

```bash
npm run setup-env
npm run typecheck
npm run clean
npm run generate-icons
npm run start
```

## Notes

- Existing app logic (`App.tsx`) is preserved.
- Route files under `src/app` are scaffold placeholders ready for full Expo Router migration.
