# SpendWise

Personal finance mobile app with a .NET backend and Appium UI tests.

## Repository layout

| Folder | Purpose |
|--------|---------|
| [`API/`](API/) | ASP.NET Core 9 backend (SQL Server, MediatR) |
| [`MobileUI/`](MobileUI/) | Expo Router React Native app |
| [`UITests/`](UITests/) | WebdriverIO + Appium end-to-end tests |

Root files (`package.json`, `pnpm-workspace.yaml`) only wire the JavaScript packages (MobileUI + UITests).

## Quick start

### API

```bash
cd API
docker compose up -d   # optional: local SQL Server
dotnet run --project src/SpendWise.Api
```

Health: `GET http://localhost:5157/api/healthz`  
Details: [API/README.md](API/README.md)

### Mobile UI

```bash
pnpm install
export EXPO_PUBLIC_API_URL=http://localhost:5157
pnpm --filter @workspace/mobile-ui run start
```

### UI tests (iOS)

Start the API, build the app, then run tests:

```bash
pnpm --filter @workspace/mobile-ui run build:e2e:ios
# Copy or export .app to MobileUI/build/SpendWise.app if needed
pnpm --filter @workspace/ui-tests run test:ios
```

CI: `.github/workflows/e2e.yml`

## Workspace commands

```bash
pnpm install
pnpm run typecheck
cd API && dotnet test
```
