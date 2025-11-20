-- Create hotels lookup table
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create management_companies lookup table
CREATE TABLE IF NOT EXISTS public.management_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hotel_tracker table
CREATE TABLE IF NOT EXISTS public.hotel_tracker (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    management_company_id UUID NOT NULL REFERENCES public.management_companies(id) ON DELETE CASCADE,
    date_reported DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT true,
    type TEXT NOT NULL CHECK (type IN ('Issue', 'Tactic')),
    description_short TEXT NOT NULL,
    description_long TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.management_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_tracker ENABLE ROW LEVEL SECURITY;

-- Hotels policies: Internal users can view, admins can manage
CREATE POLICY "Internal users can view hotels"
ON public.hotels
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.user_type = 'internal'
    )
);

CREATE POLICY "Admins can insert hotels"
ON public.hotels
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Admins can update hotels"
ON public.hotels
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Admins can delete hotels"
ON public.hotels
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Management companies policies: Internal users can view, admins can manage
CREATE POLICY "Internal users can view management companies"
ON public.management_companies
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.user_type = 'internal'
    )
);

CREATE POLICY "Admins can insert management companies"
ON public.management_companies
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Admins can update management companies"
ON public.management_companies
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Admins can delete management companies"
ON public.management_companies
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Hotel tracker policies: Internal users can view, admins can manage
CREATE POLICY "Internal users can view hotel tracker"
ON public.hotel_tracker
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.user_type = 'internal'
    )
);

CREATE POLICY "Admins can insert hotel tracker entries"
ON public.hotel_tracker
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Admins can update hotel tracker entries"
ON public.hotel_tracker
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Admins can delete hotel tracker entries"
ON public.hotel_tracker
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Create indexes for better query performance
CREATE INDEX idx_hotel_tracker_hotel_id ON public.hotel_tracker(hotel_id);
CREATE INDEX idx_hotel_tracker_management_company_id ON public.hotel_tracker(management_company_id);
CREATE INDEX idx_hotel_tracker_date_reported ON public.hotel_tracker(date_reported DESC);
CREATE INDEX idx_hotel_tracker_is_current ON public.hotel_tracker(is_current);
CREATE INDEX idx_hotel_tracker_type ON public.hotel_tracker(type);

-- Create updated_at triggers
CREATE TRIGGER update_hotels_updated_at
    BEFORE UPDATE ON public.hotels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_management_companies_updated_at
    BEFORE UPDATE ON public.management_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_tracker_updated_at
    BEFORE UPDATE ON public.hotel_tracker
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial hotels data from the CSV
INSERT INTO public.hotels (name) VALUES
('AC BY MARRIOTT GAINES DOWNTOWN'),
('Courtyard By Marriot Indianapolis Fishers'),
('COURTYARD BY MARRIOTT READING'),
('Courtyard Jacksonville Beach Oceanfront'),
('COURTYARD MARRIOTT GREENSBURG'),
('COURTYARD MARRIOTT OCEANFRONT'),
('Courtyard Pittsburgh Airport Settlers Ridge'),
('Courtyard Pittsburgh Greensburg'),
('COURTYARD PITTSBURGH SETTLERS RIDGE ROBINSON TOWNSHIP'),
('Courtyard Reading Wyomissing'),
('Courtyard San Diego Little Italy'),
('Courtyard Washington Meadow Lands'),
('Element Nashville Vanderbilt West End'),
('Embassy Suites by Hilton Memphis'),
('EVEN Hotels Seattle - South Lake Union'),
('Hampton by Hilton Inn & Suites Tallahassee Capitol - University'),
('Hampton Inn & Suites Charlottesville'),
('Hampton Inn & Suites Memphis Germantown'),
('Hampton Inn & Suites New Orleans Canal St. French Quarter'),
('Hampton Inn & Suites Tallahassee Capitol-University'),
('Hampton Inn Charlotte Uptown'),
('Hampton Inn Savannah-Historic District'),
('Hampton Inn Tampa Downtown'),
('Hampton Inn Tampa Downtown Channel District'),
('HAMPTON INN TAMPA DOWNTOWN CHANNEL DISTRICT'),
('HILTON GARDEN INN ARLINGTON'),
('HILTON GARDEN INN ATLANTA PERIMETER'),
('Hilton Garden Inn Atlanta Perimeter Center'),
('Hilton Garden Inn Boise Downtown'),
('Hilton Garden Inn Charlotte Uptown'),
('Hilton Garden Inn Jacksonville Ponte Vedra Sawgrass'),
('Hilton Garden Inn Jacksonville/Ponte Vedra'),
('HOLIDAY INN EXPRESS NASHVILLE DOWNTOWN'),
('Holiday Inn Express Nashville Downtown Conf Ctr, an IHG Hotel'),
('Holiday Inn Express Savannah-Historic District'),
('Home2 Suites Tampa Downtown Channel District'),
('Homewood Suites Salt Lake City Downtown'),
('Hyatt House Columbus Osu / Short – North'),
('Hyatt House Nashville Downtown Convention Center'),
('HYATT HOUSE NASHVILLE DOWNTOWN CONVENTION CENTER'),
('Hyatt House Tallahassee Capitol – University'),
('NEW HAVEN HOTEL NEW HAVEN'),
('Renaissance Raleigh North Hills'),
('Residence Inn Charlottesville Downtown'),
('Residence Inn Denver City Center'),
('Residence Inn Philadelphia Great Valley/Malvern'),
('Residence Inn Secaucus | Meadowland'),
('Residence Inn Tampa Downtown'),
('Staybridge Suites - South Lake Union'),
('Tempo Savannah'),
('THE LITTLE ITALY HOTEL IN DOWNTOWN SAN DIEGO'),
('TOWNE PLACE SUITES SAN DIEGO AIRPORT LIBERTY STATION'),
('HAMPTON INN & SUITES LADY LAKE/THE VILLAGES'),
('Westin Reston Heights')
ON CONFLICT (name) DO NOTHING;

-- Insert initial management companies data from the CSV
INSERT INTO public.management_companies (name) VALUES
('McKibbon'),
('Dunn hospitality'),
('Concord'),
('Aimbridge'),
('Apature'),
('Corp IHG'),
('Schulte Hospitality'),
('Raines'),
('Inter Mountain')
ON CONFLICT (name) DO NOTHING;
