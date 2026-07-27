# WorkHive

A two-sided freelance marketplace for the Indian market — connecting Creators (clients) with Workers (freelancers), with INR-native escrow payments via Razorpay.

## Local Development

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL + Redis)

### Setup

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example apps/api/.env
cp .env.example apps/web/.env
# Edit both .env files with your values

# 4. Run database migrations + seed
pnpm db:migrate
pnpm db:seed

# 5. Start both apps
pnpm dev
```

- **API**: http://localhost:4000
- **Web**: http://localhost:5173
- **DB Studio**: `pnpm db:studio`

### Test Accounts (after seeding)

| Email | Password | Role |
|---|---|---|
| creator1@test.com | Test@1234 | Client |
| creator2@test.com | Test@1234 | Client |
| worker1@test.com | Test@1234 | Freelancer |
| worker2@test.com | Test@1234 | Freelancer |
| worker3@test.com | Test@1234 | Freelancer |
