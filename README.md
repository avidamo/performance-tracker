# Performance Tracker App

Private internal app for:
- admin dashboard
- private employee pages
- action plans and soft skills
- notes and achievements
- monthly AI summaries
- manager-only notes
- live BigQuery performance intelligence

## Stack
- Next.js App Router
- Supabase Auth + Postgres + Row Level Security
- BigQuery analytics integration
- OpenAI summaries (optional)

## Included routes
- `/login`
- `/admin`
- `/admin/employees/[id]`
- `/me`
- `/api/generate-summary`
- `/api/generate-summaries`
- `/api/analytics/employee/[id]`

## What the BigQuery integration expects
The app is built to read from **two standardized BigQuery views** that you control:

1. `employee_monthly_rollup`
2. `employee_coach_rollup`

The app assumes these views contain rows keyed by:
- `employee_name`
- `month_key` in `YYYY-MM` format

The easiest setup is to make `employee_name` exactly match the employee `name` values in Supabase.

Starter SQL templates are included in:
- `bigquery/employee_monthly_rollup.sql`
- `bigquery/employee_coach_rollup.sql`

Adapt those templates to your real BigQuery source tables.

## Beginner-friendly setup order

### 1. Create Supabase project
Create a new Supabase project.

### 2. Run the database schema
In Supabase SQL Editor, run:
- `supabase/schema_and_seed.sql`

This creates:
- employees
- goals
- soft skills
- updates
- achievements
- summaries
- app_users
- RLS policies

### 3. Create auth users in Supabase
Create login users for:
- you as admin
- Jordan
- Eugene
- Elissa
- Peri
- Steph
- Mo
- Begai

### 4. Link auth users to app users
After auth users are created, insert matching rows in `public.app_users`.

Example employee row:

```sql
insert into public.app_users (id, email, role, employee_id)
values (
  'AUTH_USER_UUID_HERE',
  'employee@example.com',
  'employee',
  'EMPLOYEE_UUID_HERE'
);
```

Example admin row:

```sql
insert into public.app_users (id, email, role, employee_id)
values (
  'AUTH_USER_UUID_HERE',
  'admin@example.com',
  'admin',
  null
);
```

### 5. Build the standardized BigQuery views
Use the starter files in `/bigquery` and replace the source table names and fields with your real ones.

Create these two views in BigQuery:
- `employee_monthly_rollup`
- `employee_coach_rollup`

### 6. Set environment variables
Copy `.env.example` to `.env.local`.

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

BIGQUERY_PROJECT_ID=
BIGQUERY_LOCATION=US
BIGQUERY_DATASET=
BIGQUERY_EMPLOYEE_MONTHLY_VIEW=employee_monthly_rollup
BIGQUERY_EMPLOYEE_COACH_VIEW=employee_coach_rollup
```

Then choose **one** BigQuery credential method:

### Option A — easiest for deployment
```env
GCP_BIGQUERY_CREDENTIALS_BASE64=
```
Base64-encode the full Google service account JSON.

### Option B
```env
GCP_BIGQUERY_CREDENTIALS_JSON=
```
Paste the full JSON as one string.

### Option C
```env
GCP_BIGQUERY_CLIENT_EMAIL=
GCP_BIGQUERY_PRIVATE_KEY=
```
Use the service account email and private key.

### 7. Install and run locally
```bash
npm install
npm run dev
```

### 8. Test login and roles
- admin should land on `/admin`
- employees should land on `/me`
- employees should only see their own pages

### 9. Test BigQuery metrics
Open an employee page in admin and confirm:
- live metrics render
- revenue trend renders
- coach metrics render

### 10. Generate monthly summaries
Use the admin button to generate summaries.
If `OPENAI_API_KEY` is set, the summary prompt will include both Supabase performance notes and BigQuery analytics.

## Important note about users
This project separates:
- `auth.users` (Supabase login accounts)
- `public.app_users` (role + employee mapping)

## Live analytics behavior
If BigQuery is not configured:
- the app still works
- the dashboards show a friendly warning
- summaries still generate using Supabase-only data

If BigQuery is configured:
- employee pages show live revenue and portfolio metrics
- admin employee pages show live trend and coach metrics
- AI summaries use both qualitative and quantitative inputs

## Suggested next improvements
- add admin write-back notes from analytics alerts
- add metric thresholds and alert banners
- add scheduled monthly summary jobs
- add PDF export for review packets
- add a CAM leaderboard / portfolio heatmap
