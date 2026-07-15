# Deployment & Environment Setup

FutoNav has three moving parts: a **Supabase** backend (DB + Storage), the
**admin portal** (Next.js, host on Vercel), and the **mobile app** (Expo, built
with EAS or the Gradle CI pipeline).

Real env values live in gitignored files (`.env`, `.env.development`,
`.env.production`, `.env.local`). The committed `.env.example` files are the
reference. On hosting platforms you set env vars in the platform dashboard —
`.env.production` files are only used for self-hosting (`next start`) / local.

---

## 1. Supabase (do this first)

1. **Apply the schema** to your cloud project. In the Supabase Dashboard → SQL
   Editor, run the contents of, in order:
   - `supabase/migrations/0001_init.sql` (pois table, indexes, trigger)
   - `supabase/migrations/0002_rls.sql` (row-level security policies)
   (Or with the CLI: `supabase link --project-ref ehiijxskoezohxthbles` then
   `supabase db push`.)
2. **Storage bucket**: create a **public** bucket named `futonavapp`
   (Storage → New bucket → Public). The admin also auto-creates it on first
   upload if the service key is present, but creating it yourself is clearer.
3. **Grab your keys** (Dashboard → Project Settings → API keys):
   - **Publishable / anon key** (`sb_publishable_…`) → client apps (mobile + admin public).
   - **Service role / secret key** (`sb_secret_…`) → admin server only. Bypasses RLS.
     Never ship this to a client or the mobile app.

RLS is already set so anyone can read POIs (mobile) and only the service key can
write (admin).

---

## 2. Admin portal on Vercel

- **Import** the GitHub repo in Vercel. Set **Root Directory** = `apps/admin`.
  Vercel detects Next.js and pnpm workspaces automatically.
- **Environment Variables** (Settings → Environment Variables) — set for
  *Production* (and *Preview* if you want preview deploys):

  | Name | Value | Notes |
  |------|-------|-------|
  | `NEXT_PUBLIC_SUPABASE_URL` | `https://ehiijxskoezohxthbles.supabase.co` | |
  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_…` | |
  | `SUPABASE_SERVICE_KEY` | `sb_secret_…` | **Sensitive.** Not `NEXT_PUBLIC`. Required for writes + uploads. |
  | `SUPABASE_STORAGE_BUCKET` | `futonavapp` | |
  | `JWT_SECRET` | a long random string | Signs the admin session cookie. |
  | `ADMIN_EMAIL` | your admin email | Login. |
  | `ADMIN_PASSWORD` | a strong password | Login. |

- **Redeploy** after changing env vars (Vercel bakes `NEXT_PUBLIC_*` at build time).
- **Image uploads** go browser → Supabase directly via a signed upload URL
  (only tiny metadata passes through the server), so Vercel's ~4.5 MB serverless
  body limit does not apply. The service key stays server-side.

---

## 3. Mobile app — Expo / EAS preview build

The `.env*` files are gitignored, so **EAS does not receive them**. Set the
values as **EAS environment variables** instead (Expo dashboard → Project →
Environment variables, or `eas env:create`), for the `preview` (and
`production`) environments:

```
EXPO_PUBLIC_SUPABASE_URL       = https://ehiijxskoezohxthbles.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY  = sb_publishable_…
EXPO_PUBLIC_GOOGLE_MAPS_KEY    = <maps key with Routes API enabled>
GOOGLE_MAPS_ANDROID_KEY        = <android maps key>
GOOGLE_MAPS_IOS_KEY            = <ios maps key>
```

Then build the installable preview APK (already configured in `eas.json`:
`preview` → `buildType: apk`, internal distribution):

```bash
cd apps/mobile
eas login
eas build --platform android --profile preview
```

EAS returns an install URL / downloadable APK for internal testers. For a store
build use `--profile production` (outputs an `.aab`).

### Google Cloud requirements (mobile)
- Enable the **Routes API** (not the retired legacy Directions API) on the project.
- The key used for the Routes API (`EXPO_PUBLIC_GOOGLE_MAPS_KEY`) must allow it —
  a key restricted to the Maps SDK alone will be rejected for REST calls.

---

## 4. Alternative: production APK via GitHub Actions (no Expo)

`.github/workflows/build-apk.yml` builds a signed APK with Gradle (no EAS) when a
commit to `master`/`main` contains `[BUILD]`, or via manual dispatch. Configure
these **GitHub repo secrets** (Settings → Secrets → Actions):

- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_GOOGLE_MAPS_KEY`, `GOOGLE_MAPS_ANDROID_KEY`
- Optional release signing: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` (without these the APK is debug-signed — fine for sideloading, not the Play Store).

The APK is published as a workflow artifact and a GitHub Release.
