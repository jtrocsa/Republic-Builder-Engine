# Google sign-in setup (Phase 50A)

**Status: app code is already done and pushed to `main`.** The only remaining step is external
console configuration that only the project owner (with access to the Google Cloud Console
project and the Supabase dashboard) can perform — an agent cannot do this part, since it requires
creating credentials in third-party consoles tied to your accounts.

## What already exists in code

- `apps/web/src/repositories/remote-auth-repository.js`'s `signInWithOAuthGoogle()` calls
  `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: ... } })`.
- `main.js`'s `loginScreen()` renders a "Continue with Google" button (teachers only — students
  always join via a teacher-provisioned roster slot, never this path) wired to a
  `continue-with-google` click handler that calls `signInWithOAuthGoogle()` and surfaces any
  error through the normal `authUiState.error` path.
- Today, clicking that button throws a Supabase error to the effect of "Unsupported provider:
  provider is not enabled" — expected, since no Supabase project has a Google provider configured
  yet.

Nothing else needs to change in this repo for Google sign-in to start working. Once the two
steps below are done, the existing button/flow works with no further deploy.

## Step 1 — Create an OAuth client in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a project (or reuse
   an existing one) for Chronicle/Odysso.
2. **APIs & Services → OAuth consent screen**: configure it (External user type is fine for a
   school-facing app; internal apps aren't publicly usable). Add your support email and the app
   name ("Chronicle" or "Odysso").
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**, application type
   **Web application**.
4. Under **Authorized redirect URIs**, add your Supabase project's auth callback URL:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
   (find `<your-project-ref>` in the Supabase dashboard's Project Settings → General, or in the
   `VITE_SUPABASE_URL` value already in this repo's `.env.local`/Vercel env vars).
5. Save. Copy the generated **Client ID** and **Client Secret** — you'll paste both into Supabase
   next.

## Step 2 — Enable the provider in Supabase

1. Supabase dashboard → your project → **Authentication → Providers → Google**.
2. Toggle it on, paste the Client ID and Client Secret from Step 1.
3. Save.

That's it — no code change, no redeploy needed. The existing "Continue with Google" button on the
teacher login screen will start completing a real OAuth round trip instead of erroring.

## Verifying it worked

1. Open the deployed app (or `npm run dev`), go to the teacher login screen, click
   "Continue with Google."
2. You should land on Google's account picker/consent screen, not an error message.
3. After granting consent, you should land back in the app signed in. Confirm a `profiles` row
   was created for the new Google-authenticated user (the existing DB trigger from migrations
   0003/0005 handles this the same way it does for password sign-up) and that
   `getCurrentClassroomId()`/the teacher dashboard load correctly for that account.
4. If nothing was banked as an e2e test for this yet, treat this manual pass as the verification
   this phase requires. A real Playwright OAuth-callback test isn't practical here (it requires
   a live third-party consent screen), so this manual check is the actual, not deferred, ceiling
   for this feature — same category of gap already documented for the claim/login/grade round
   trip in `PHASES-46-50.md`'s Phase 50 verification note.
