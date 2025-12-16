-- 001_extensions.sql
-- Core extensions needed for The MentalPitch database

-- Enable pgcrypto for gen_random_uuid(), which we use for primary keys.
create extension if not exists "pgcrypto";


