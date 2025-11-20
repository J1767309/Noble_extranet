-- Convert all hotel and management company names to title case
-- This migration handles duplicates by merging entries that will become identical after conversion

-- Step 1: Handle hotel duplicates
-- For hotels that will have the same title case name, merge them by updating references
DO $$
DECLARE
    duplicate_group RECORD;
    keep_id UUID;
    delete_ids UUID[];
BEGIN
    -- Find groups of hotels that will become duplicates after INITCAP
    FOR duplicate_group IN
        SELECT INITCAP(name) as title_name, array_agg(id) as ids
        FROM public.hotels
        GROUP BY INITCAP(name)
        HAVING COUNT(*) > 1
    LOOP
        -- Keep the first ID, delete the rest
        keep_id := duplicate_group.ids[1];
        delete_ids := duplicate_group.ids[2:array_length(duplicate_group.ids, 1)];

        -- Update hotel_tracker entries to point to the kept hotel
        UPDATE public.hotel_tracker
        SET hotel_id = keep_id
        WHERE hotel_id = ANY(delete_ids);

        -- Delete the duplicate hotels
        DELETE FROM public.hotels
        WHERE id = ANY(delete_ids);

        RAISE NOTICE 'Merged hotel duplicates for: %', duplicate_group.title_name;
    END LOOP;
END $$;

-- Step 2: Convert hotel names to title case
UPDATE public.hotels
SET name = INITCAP(name);

-- Step 3: Fix common typo: Marriot → Marriott
UPDATE public.hotels
SET name = REPLACE(name, 'Marriot', 'Marriott')
WHERE name LIKE '%Marriot%';

-- Step 4: Handle management company duplicates
DO $$
DECLARE
    duplicate_group RECORD;
    keep_id UUID;
    delete_ids UUID[];
BEGIN
    -- Find groups of companies that will become duplicates after INITCAP
    FOR duplicate_group IN
        SELECT INITCAP(name) as title_name, array_agg(id) as ids
        FROM public.management_companies
        GROUP BY INITCAP(name)
        HAVING COUNT(*) > 1
    LOOP
        -- Keep the first ID, delete the rest
        keep_id := duplicate_group.ids[1];
        delete_ids := duplicate_group.ids[2:array_length(duplicate_group.ids, 1)];

        -- Update hotel_tracker entries to point to the kept company
        UPDATE public.hotel_tracker
        SET management_company_id = keep_id
        WHERE management_company_id = ANY(delete_ids);

        -- Update management_tracker entries to point to the kept company
        UPDATE public.management_tracker
        SET management_company_id = keep_id
        WHERE management_company_id = ANY(delete_ids);

        -- Delete the duplicate companies
        DELETE FROM public.management_companies
        WHERE id = ANY(delete_ids);

        RAISE NOTICE 'Merged company duplicates for: %', duplicate_group.title_name;
    END LOOP;
END $$;

-- Step 5: Convert management company names to title case
UPDATE public.management_companies
SET name = INITCAP(name);

-- Step 6: Preserve acronyms - keep IHG as all caps
UPDATE public.management_companies
SET name = 'Corp IHG'
WHERE name = 'Corp Ihg';
