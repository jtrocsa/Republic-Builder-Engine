-- Adds an org/school field to teacher profiles, collected during the
-- teacher signup wizard (main.js's loginScreen() step 1). Nullable: existing
-- rows predate this column and student profiles never set it.

alter table profiles add column school_name text;
