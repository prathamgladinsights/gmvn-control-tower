# GMVN Control Tower

Guest Feedback Intelligence + Inventory Management System  
Garhwal Mandal Vikas Nigam Limited

---

## Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14 (App Router) + Tailwind  |
| Auth       | Clerk (login, roles, password reset)|
| Database   | PostgreSQL on Railway               |
| Backend    | Node.js + Express on Railway        |
| Voice AI   | Sarvam / Fundamento (webhooks ready)|
| AI Scoring | Anthropic Claude Haiku              |
| Email      | SendGrid                            |

---

## Setup — Do This Once

### 1. Railway
- Create project on railway.app
- Add PostgreSQL service → copy DATABASE_URL
- Add a second service (Node.js) for the backend

### 2. Run Schema
- Open Railway PostgreSQL → Query tab
- Paste and run `schema/001_initial_schema.sql`
- This seeds all 82 properties + inventory catalogue

### 3. Clerk
- Create app on clerk.com
- Enable Email + Password
- Copy Publishable Key and Secret Key
- In Clerk dashboard → Users → set publicMetadata for admins:
  ```json
  { "role": "super_admin" }
  ```
- For property managers:
  ```json
  { "role": "property_manager", "property_id": 1 }
  ```

### 4. Google Cloud
- Enable Sheets API + Places API
- Create Service Account → download JSON key
- Share GMVN Google Sheet with service account email (read-only)

### 5. Environment Variables

Copy `.env.local.example` to `.env.local` in `/frontend`  
Copy and fill `.env` in `/backend`

### 6. Run Locally

```bash
# Frontend
cd frontend
npm install
npm run dev        # http://localhost:3000

# Backend
cd backend
npm install
node server.js     # http://localhost:4000

# Sheet sync (run manually or set as cron)
cd scripts
node sync-sheet.js
```

### 7. Deploy to Railway

**Frontend**: Connect GitHub repo → set root to `/frontend` → Railway auto-deploys Next.js  
**Backend**: Connect GitHub repo → set root to `/backend` → start command: `node server.js`

Set all environment variables in Railway dashboard for both services.

---

## Cron Jobs (set in Railway or external cron)

| Job                  | Schedule      | Command                              |
|----------------------|---------------|--------------------------------------|
| Google Sheet sync    | Daily 11pm    | `node scripts/sync-sheet.js`         |
| Trigger calls        | Daily 10am    | `node scripts/trigger-calls.js`      |
| Google Reviews fetch | Weekly Sunday | `node scripts/fetch-reviews.js`      |
| AI Insights generate | Weekly Monday | `node scripts/generate-insights.js`  |

---

## Voice AI Webhook URLs

Once deployed, give these to Sarvam and Fundamento:

- **Sarvam**: `https://your-backend.railway.app/api/webhooks/sarvam`
- **Fundamento**: `https://your-backend.railway.app/api/webhooks/fundamento`

---

## User Roles

| Role              | Access                                                    |
|-------------------|-----------------------------------------------------------|
| `super_admin`     | All properties, all data, approve requisitions, manage users |
| `property_manager`| Own property only, raise requisitions + alerts            |

---

## Adding a Property Manager

1. Go to Dashboard → User Management → Add User
2. Enter name, email, assign property
3. System sends Clerk invitation email
4. Manager sets own password via email link
5. Password reset available anytime at /sign-in → "Forgot password"
