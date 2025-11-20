-- Rename comments column to description_long in hotel_top_accounts table
ALTER TABLE public.hotel_top_accounts
RENAME COLUMN comments TO description_long;
