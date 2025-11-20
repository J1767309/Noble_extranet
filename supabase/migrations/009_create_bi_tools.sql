-- Create bi_tools table
CREATE TABLE IF NOT EXISTS public.bi_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    frequency TEXT NOT NULL,
    location TEXT NOT NULL,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bi_tools ENABLE ROW LEVEL SECURITY;

-- Policy: All internal users can view BI tools
CREATE POLICY "Internal users can view BI tools"
ON public.bi_tools
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.user_type = 'internal'
    )
);

-- Policy: Only admins can insert BI tools
CREATE POLICY "Admins can insert BI tools"
ON public.bi_tools
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Policy: Only admins can update BI tools
CREATE POLICY "Admins can update BI tools"
ON public.bi_tools
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Policy: Only admins can delete BI tools
CREATE POLICY "Admins can delete BI tools"
ON public.bi_tools
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Insert existing BI tools data
INSERT INTO public.bi_tools (number, name, description, frequency, location, link) VALUES
(1, 'Weekly Forecast Sheet (Yellow sheet)', 'This report presents a weekly comparison of production metrics for hotels against multiple benchmarks: the Noble Budget, the forecast for the current month, the operational summary, the manager''s budget, and the previous year''s data', 'Weekly', 'Noble Dropbox/Monthly Forecasts', NULL),
(2, 'Monthly forecast (Blue sheet)', 'This report provides a monthly analysis of hotel production metrics, juxtaposing actual figures with various benchmarks: the Noble Budget, the manager''s budget, the previous operational summary, the current operational summary, and the forecast for the respective months.', 'Monthly', 'Noble Dropbox/Monthly Forecasts', NULL),
(3, 'Email Report (In the Monthly Forecast)', 'The report provides a detailed summary for each hotel, covering the most recent month and year-to-date (YTD) performance, comparing actual results against the manager''s budget, the Noble budget, and the previous year''s figures. It highlights management issues in revenue and expenses and includes the most current Guest Satisfaction Survey (GSS) results.', 'Monthly', 'Tab in Noble Dropbox/Monthly Forecasts', NULL),
(4, 'Ops report', 'This report delivers an in-depth analysis of key performance indicators (KPIs) for each hotel, comparing the actuals from the past three years against current year budget and the forecasts for selected months. It quantifies the KPIs relative to the 2019 metrics, represented as a percentage. To further highlight performance discrepancies between the most recent operational summary and the last summary that was published and the variances budget', 'Monthly', 'Noble Dropbox/Monthly Forecasts', NULL),
(5, 'Ops memo', 'This report presents an overview of the U.S. market''s current performance, updates on ongoing renovations across our hotel portfolio, and examination of portfolio-wide trends concerning Revenue per Available Room (RevPAR), Average Daily Rate (ADR), and Occupancy rates. Additionally, it examines market-specific factors influencing individual hotel forecasts and concludes with the latest forecasts from CBRE and LARC.', 'Monthly', 'Noble Dropbox/Monthly Forecasts', NULL),
(6, 'Monthly Stats report', 'The ''Monthly Hotel Statistics Report'' provides a comprehensive performance review of the Noble Total Portfolio, revealing key financial metrics and market trends. It compares current ADR, RevPAR, and occupancy rates against past years and budget forecasts, noting a steady recovery yet challenges in achieving budget targets. The report concludes with a summary of revised growth forecasts from CBRE and LARC for the U.S. market', 'Monthly', 'Noble Dropbox/Asset Management Team Folder/Monthly Report Package', NULL),
(7, 'Tableau', E'• STR\n• Channel Contribution Report\n• Gov Per Diem\n• Hyatt Report: Koddi\n• Hilton Reports: Hilton Koddi, Hilton Loyalty Report\n• Labor Survey\n• Market Forecasts\n• Marriott Report: Loyalty Report, Koddi Marriott Report, Traffic Source Report\n• Travelads Report', 'Monthly', 'Link (URL to be added)', NULL),
(8, 'Marriott M-Dash: Topline Activators Report', 'A business intelligence tool that uses data visualization and dynamic reporting capabilities to consolidate Foundational/Critical Business Metrics into one place. It has the ability to drill down, dynamically filter, and compare portfolio level data in multiple avenues of reporting including web and mobile. The currently platform utilizes, Microsoft PowerBI that requires authentication through Microsoft via your Marriott EID. If you are currently signed in to Microsoft via your Noble account you will either need to sign out, or use a different web browser to access the platform', 'Daily', 'Link (URL to be added)', NULL),
(9, 'Hilton Owners Engagement Report', 'The Enterprise Engagement Snapshot visualizes key metrics (Commercial, Operational, and Initiative) for your portfolio of hotels in YTD, 6-month or 3-month increments.', 'Monthly', 'Link (URL to be added)', NULL),
(10, 'Demand360', 'The platform provides demand data by channel and segmentation for both historical and future time frames.', 'Daily', 'Link (URL to be added)', NULL),
(11, 'Noble Power BI', 'The platform provides a detailed expense analysis platform for each Noble hotels.', 'Monthly', 'Link (URL to be added)', NULL),
(12, 'Light House Report', 'The platform offers detailed insights into each hotel''s performance by segment and includes access to forecasts from the system, the Revenue Management System (RMS), and inputs from the user', 'Daily', 'Link (URL to be added)', NULL),
(13, 'Hotel Initiatives Document', 'Asset manager documents, the hotels, expense, and revenue initiatives', 'Monthly', 'Asset Management Team Folder/Hotels/Initiatives', NULL),
(15, 'eCommerce Matrix', 'This report outlines the key e-commerce strategies recommended for each property, indicating the level of engagement by individual hotels in the specified tactics. It emphasizes that not every tactic is actively pursued; instead, participation is aligned with each property''s strategic goals and initiatives', 'Monthly', 'Asset Management Team Folder/E-Commerce and Revenue Management', NULL),
(16, 'OneNote', E'Each one note, notebook contains detailed notes by each asset manager, as it pertains to each of their hotels', 'Monthly', E'• Steven\n• Lisa\n• Denise\n• Jody\n• Michael', NULL);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bi_tools_updated_at
    BEFORE UPDATE ON public.bi_tools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
