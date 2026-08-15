ALTER TABLE ibes_users
  ADD COLUMN IF NOT EXISTS password_hash TEXT;
