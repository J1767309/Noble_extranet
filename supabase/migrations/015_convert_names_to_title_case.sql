-- Convert all hotel and management company names to title case

-- Convert hotel names to title case
UPDATE public.hotels
SET name = INITCAP(name);

-- Fix common typo: Marriot → Marriott
UPDATE public.hotels
SET name = REPLACE(name, 'Marriot', 'Marriott')
WHERE name LIKE '%Marriot%';

-- Convert management company names to title case
UPDATE public.management_companies
SET name = INITCAP(name);

-- Preserve acronyms - keep IHG as all caps
UPDATE public.management_companies
SET name = 'Corp IHG'
WHERE name = 'Corp Ihg';
