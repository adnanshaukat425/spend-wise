# SpendWise Backend (.NET 9)

ASP.NET Core Web API with EF Core, SQL Server, and CQRS (MediatR).

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- Docker (optional, for local SQL Server)

## Quick start

```bash
# Start SQL Server
cd API
docker compose up -d

# Apply migrations and run API
dotnet run --project src/SpendWise.Api
```

Swagger UI: http://localhost:5000/swagger (or the port shown in console)

Health: `GET /API/healthz` · Readiness: `GET /API/readyz`

## Configuration

Copy `.env.example` and set values, or edit `src/SpendWise.Api/appsettings.json`:

| Key | Description |
|-----|-------------|
| `ConnectionStrings__DefaultConnection` | SQL Server connection string |
| `Jwt__SigningKey` | HMAC signing key (min 32 chars) |
| `Google__ClientId` | Google OAuth client ID |
| `Apple__ClientId` | Apple Sign In service ID |

## Dev auth

In Development, use stub tokens:

```bash
# Google login
curl -X POST http://localhost:5000/API/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"dev-google:user123:test@gmail.com"}'

# Apple login
curl -X POST http://localhost:5000/API/auth/apple \
  -H "Content-Type: application/json" \
  -d '{"identityToken":"dev-apple:user456:test@icloud.com"}'
```

## Migrations

```bash
cd API/src/SpendWise.Infrastructure
dotnet ef migrations add MigrationName --startup-project ../SpendWise.Api
dotnet ef database update --startup-project ../SpendWise.Api
```

Migrations live under `src/SpendWise.Infrastructure/Persistence/Migrations/`.

## Project layout

```
API/
├── src/
│   ├── SpendWise.Api/           # HTTP controllers, middleware
│   ├── SpendWise.Application/   # CQRS handlers, validators, DTOs
│   ├── SpendWise.Domain/        # Entities and enums
│   └── SpendWise.Infrastructure/# EF Core, Identity, JWT, seed
└── tests/
    └── SpendWise.Application.Tests/
```

## Tests

```bash
dotnet test API/SpendWise.sln
```
