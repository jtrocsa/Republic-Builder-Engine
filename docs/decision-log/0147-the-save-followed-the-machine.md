# 0147 — The save followed the machine

**Phase 148 · 2026-09-20 · Accepted**

`0146` §5 ended by naming two things it had not walked — roster provisioning and password reissue —
and explaining that they were a second door rather than a wider one: both go through `/api/roster/*`,
the repo's own serverless functions, and not through Supabase at all.

This phase builds that door. It opened more than those two: **the student join flow had never been
walked either**, and it is the first screen a real student ever reaches.

Walking it found that a save belongs to a machine rather than to a student. A returning student
signed in with their own correct password and their three completed cases were replaced by their
classmate's one, in their own cloud row.

---

## 1. The second door

`tests/e2e/helpers/roster-api-stub.js` answers `/api/roster/provision`, `/claim`, `/resolve-email`
and `/reissue` from the same tables `stubSupabase()` is serving. Under `npm run dev` those paths do
not exist — Vite serves `apps/web`, not `api/` — so every one of them 404s and the screen says
"Could not add roster slots." That is why none of this was reachable.

**What is under test is the client half**: the form validation, the handler, the state the app moves
to, and what the next screen reads back. The endpoint bodies are not, and cannot be — they run on
Vercel against a real Postgres. What the stub owes them is their **contract** and their **rules**,
because the rules are what make the client's failure branches reachable at all. A seat that is
already claimed has to be refused, or "Invalid join code or student ID." is a string no test will
ever see. The branch structure mirrors the four handlers deliberately, including the property worth
stating twice: **claim and resolve-email answer every mismatch identically**, so that neither a join
code nor a student ID can be enumerated.

One capability had to move to the Supabase stub with it. `signInWithPassword` goes to GoTrue, and a
stub that grants a session to anything cannot show a wrong password being refused — which is the
branch students actually hit. So the stub now **checks the password of an account it created**, and
leaves everything else permissive. That rule is the right way round rather than a mode switch: the
stub knows the password of an identity it minted at `claim`, and it does not know the fixed
`dev-fake-teacher` credentials, which must keep getting through.

## 2. A save had no owner

`progress` is one flat blob under one `localStorage` key, and nothing in it said whose it was.
`resolveProgressConflict()` therefore did the only thing it could: compare two timestamps.

```js
return remoteTimestamp > localTimestamp ? remote.progress : local;
```

On a cart Chromebook that rotates between students every period, **the newest save is reliably the
one the last student left.** So it won.

The irony is that the file knew. `progress-repository.js`'s own header says it exists because "real
classrooms mean shared/rotating school Chromebooks", and `remote-auth-repository.js` clears its
profile cache on a different user signing in, with the comment "so a stale profile never leaks
across accounts on a shared browser (a real risk on shared school Chromebooks)". The profile was
protected. The save was not.

Measured end to end through the new door — teacher provisions two seats, Bede claims one and plays,
Ada sits down at the same machine and claims the other, Bede comes back the next day:

|                                            | `student_world_profiles` after             |
| ------------------------------------------ | ------------------------------------------ |
| Bede claims seat 02                        | Bede: `["case-001"]`                       |
| Bede works at home (his row only)          | Bede: `["case-001","case-002","case-003"]` |
| Ada claims seat 01 **on the same machine** | Bede: `[…three…]`, **Ada: `["case-001"]`** |
| Bede signs in again, correct password      | **Bede: `["case-001"]`**                   |

Two things are wrong in that table. The machine's save reached **two different students' rows**; and
Bede's three cases were **destroyed** — not merely shadowed locally, but overwritten in the one copy
that follows him to another device. Nothing on screen said anything. He was shown his classmate's
game and it looked like his own.

## 3. The fix, in two parts, because there were two ways in

**Ownership, asked before the timestamps and never as a tiebreaker.** `progress.ownerUserId` is
stamped by `hydrateRemoteProgress()`, which main.js wires to `onAuthStateChange` as well as to boot,
so every sign-in passes through it. A local save owned by somebody else is not a candidate however
recent it is: the remote copy is taken instead, or — when this student has none — `null`, which the
caller reads as start clean rather than keep what is here.

**An unowned save is still absorbed**, deliberately. That is the only way progress made before
signing in ever reaches an account, and it is a real feature: a student who plays the intro before
their teacher hands out codes should not lose it.

That alone was not enough, and the second half is the part a code reading would have missed.
Re-measured with only the ownership rule in place, Ada correctly started clean and Bede correctly
got his three cases back **locally** — and his cloud row was left holding an empty save.

Signing in is two independent async paths. The handler sets the screen and calls `save()`;
`onAuthStateChange` hydrates. The handler wins, holding whatever was on the machine before hydration
had decided anything, and `saveProgress` captures that blob and pushes it two seconds later — to the
row of the student who has just signed in. So the fix is also a guard at the push:

```js
if (saved.ownerUserId && saved.ownerUserId !== session.user.id) return null;
```

**A save is only ever pushed to the row of the student it belongs to.** With both halves, every cell
of the table above is right: one row, three cases, throughout.

## 4. Two more, found on the way past

**A refused sign-in emptied the form.** The join screen's inputs are uncontrolled and read at submit
time — `passwordFieldMarkup()`'s own comment says so, and avoids `render()` on the show/hide toggle
for exactly that reason — but the `render()` that draws a refusal wiped them. A student who mistyped
their password had to re-enter the classroom code and the student ID they had just been handed on a
slip of paper. Measured before: `""` and `""`. After: `"STUB01"` and `"02"`.

The fix is the pattern already in the file. The teacher **signup** wizard has held its values in
`authUiState.signupDraft` since it shipped; the two **sign-in** forms never got the equivalent.
Passwords are deliberately not kept — the field that was wrong is the one to clear — and the draft is
cleared on success as well as set on failure, because leaving one student's classroom code sitting in
the form for the next person is the same mistake as leaving them their save.

**The roster's NAME column was always "—".** `roster_slots.display_name` is only set when a teacher
provisions seats _with_ names, and **no screen offers that** — the dashboard's form is a count, and
the signup wizard's bulk path passes a count too. What a student types when they claim a seat goes to
auth metadata and, through the `on_auth_user_created` trigger, to `profiles.display_name`. Nothing
joined the two, so a teacher could see a student's real name on a submission and not on the roster
where they would match a seat to a person.

This one is unfinished wiring rather than a design choice, and the schema says so itself:
`0001_init.sql`'s `profiles_teacher_reads_roster_students` policy exists, and its comment reads "for
roster display". `getStudentDisplayNames()` is a flat `.in()` lookup — `roster_slots.auth_user_id`
references `auth.users`, not `profiles`, so PostgREST has no relationship to embed — and the teacher's
own label still wins where one exists.

## 5. What is deliberately not fixed, and is the owner's call

**A student cannot sign out.** `signOut()` has exactly one caller in the whole app,
`teacher-sign-out`, and it renders only on the teacher dashboard. A student on a shared machine
cannot leave their account, and **nothing tells them whose account they are in** —
`currentProfile.displayName` is printed in one place, "Signed in as …" on the teacher dashboard.

With this phase's fix the consequence is no longer data loss: a student who signs in as themselves
gets their own game, and one who does not is playing in a classmate's session that will not receive
their work. But the affordance is missing, and adding it is a design decision rather than a repair —
where the control sits, what it says, and whether it clears the local save. It is put here rather
than invented.

**And the absorb rule is the residual.** An unowned save is taken on by whoever signs in next, by
design, and a teacher's save is unowned (`hydrateRemoteProgress` is only called for students), as is
any save made while signed out. So a machine a teacher demonstrated on still hands its save to the
next student who signs in. That is indistinguishable from the solo-absorb feature, because it **is**
the solo-absorb feature. Whether it should survive a classroom sign-in is a trade — losing a
student's pre-join progress against inheriting a stranger's — and it belongs to the owner too.

---

## Verification

`npm run check` clean — **2,414 unit tests across 83 files** (2,409/83 before), ESLint 0 errors and
the same 5 pre-existing warnings, cspell 0 issues across 629 files, `validate:content` 169 groups.
`npm run build` clean.

**Watched fail**, with the source fixes stashed and the guards left in place:

- the two ownership unit cases, at _"expected { lastSavedAt: 9000, …(2) } to be { Object
  (completedCases) }"_ and _"…to be null"_;
- the lifecycle spec, at _"a student signing in on the Chromebook a classmate used last period was
  handed that classmate's game"_;
- the reissue spec, at _"the roster does not show the name the student chose when they claimed their
  seat"_.

The form-draft assertion sits behind the first of those and could not be reached in the same run; it
was measured directly instead, `""` before and `"STUB01"` after, on the same page in the same probe.

`classroom-lifecycle.spec.js` runs in **16.3 seconds**, offline, and nothing leaves the machine. The
**full Playwright suite was run** because this changes the student save path, which no
teacher-surface spec covers: **411 passed, 0 failed, 0 flaky, 17.7 minutes**, all 61 visual
baselines among them and none moved. The ten tests across the five specs that share the two stubs
were then re-run together — **10 passed in 37.5 seconds** — because a helper was edited after the
full run had started.
