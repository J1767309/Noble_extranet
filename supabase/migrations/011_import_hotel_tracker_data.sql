-- Import hotel tracker data from CSV
-- This script imports all existing issues and tactics from the CSV file

-- Helper function to get hotel ID by name
CREATE OR REPLACE FUNCTION get_hotel_id(hotel_name TEXT)
RETURNS UUID AS $$
DECLARE
    hotel_id UUID;
BEGIN
    SELECT id INTO hotel_id FROM public.hotels WHERE name = hotel_name LIMIT 1;
    RETURN hotel_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get management company ID by name
CREATE OR REPLACE FUNCTION get_company_id(company_name TEXT)
RETURNS UUID AS $$
DECLARE
    company_id UUID;
BEGIN
    SELECT id INTO company_id FROM public.management_companies WHERE name = company_name LIMIT 1;
    RETURN company_id;
END;
$$ LANGUAGE plpgsql;

-- Insert all tracker entries
-- Note: "Tatic" is corrected to "Tactic" in the data
INSERT INTO public.hotel_tracker (hotel_id, management_company_id, date_reported, is_current, type, description_short, description_long) VALUES
(get_hotel_id('AC BY MARRIOTT GAINES DOWNTOWN'), get_company_id('McKibbon'), '2025-10-30', true, 'Issue', 'Marriott Activator Score', '87.5'),
(get_hotel_id('Courtyard By Marriot Indianapolis Fishers'), get_company_id('Dunn hospitality'), '2025-04-21', true, 'Issue', 'Booking.com Content Score', NULL),
(get_hotel_id('Courtyard By Marriot Indianapolis Fishers'), get_company_id('Dunn hospitality'), '2025-04-21', true, 'Issue', 'Low Activator Score', NULL),
(get_hotel_id('COURTYARD BY MARRIOTT READING'), get_company_id('Concord'), '2025-10-30', true, 'Issue', 'Marriott Activator Score', '90'),
(get_hotel_id('Courtyard By Marriot Indianapolis Fishers'), get_company_id('Dunn hospitality'), '2025-10-30', true, 'Issue', 'Marriott Activator Score', '75'),
(get_hotel_id('Courtyard Jacksonville Beach Oceanfront'), get_company_id('McKibbon'), '2025-04-21', false, 'Issue', 'Low Activator Score', NULL),
(get_hotel_id('Courtyard Jacksonville Beach Oceanfront'), get_company_id('McKibbon'), '2025-05-16', true, 'Tactic', 'Continue tracking progress on upgraded website, as well as scheduling a photo shoot for the completed model rooms.', 'Reaching out to photographer network to find next availability and pricing
 Scheduling meeting with GM & DOS to gather additional content needed for upgraded website'),
(get_hotel_id('Courtyard Jacksonville Beach Oceanfront'), get_company_id('McKibbon'), '2025-05-17', true, 'Tactic', 'Low Marriott activation score of 65', 'RMs are working with TeDra/Lisa on action plans and have provided them those specific plans during monthly P&L Calls and Property Visits

eCommerce reviewing M.com opportunities outside of existing plans (upgraded website, model room photography)'),
(get_hotel_id('Courtyard Jacksonville Beach Oceanfront'), get_company_id('McKibbon'), '2025-05-18', true, 'Tactic', 'SEO Linkbuilding', 'Completed training with DOS
 Monthly follow up scheduled on 5/13 to review progress'),
(get_hotel_id('COURTYARD MARRIOTT GREENSBURG'), get_company_id('Concord'), '2025-10-30', true, 'Issue', 'Marriott Activator Score', '23'),
(get_hotel_id('COURTYARD MARRIOTT OCEANFRONT'), get_company_id('McKibbon'), '2025-10-30', true, 'Issue', 'Marriott Activator Score', '75'),
(get_hotel_id('Courtyard Pittsburgh Airport Settlers Ridge'), get_company_id('Concord'), '2025-04-21', false, 'Issue', 'Low Booking.com Score & Expedia', NULL),
(get_hotel_id('Courtyard Pittsburgh Greensburg'), get_company_id('Concord'), '2025-04-21', false, 'Issue', 'Low Activator Score', NULL),
(get_hotel_id('Courtyard Pittsburgh Greensburg'), get_company_id('Concord'), '2025-04-21', false, 'Issue', 'negative RevPAR growth for brand & OTA', 'We are seeing positive trends with strong YOY growth for April MTD: Brand.com RevPAR growth +32% YOY, and RPI growth of 38% YOY. (Comp Set saw -4.3% declines). OTA RevPAR growth is 61% YOY, and RPI growth of 50%. Discussing the poor March performance with the team.

For Brand.com, we added a new Pet Package and worked with our RM team on two new local packages in MBOP. For OTA, we do have an Accelerator in place. We saw some opportunity in Expedia for weekends in May and have scheduled ads built out (we also have a scheduled ad for the 4th of July weekend). We''ll keep a close eye on the Travel Ads budget as there may be some room to increase it to drive incremental revenue.  We''ll have a better read on as we progress through the month.'),
(get_hotel_id('COURTYARD PITTSBURGH SETTLERS RIDGE ROBINSON TOWNSHIP'), get_company_id('Concord'), '2025-10-30', true, 'Issue', 'Marriott Activator Score', '75'),
(get_hotel_id('Courtyard Reading Wyomissing'), get_company_id('Concord'), '2025-04-21', false, 'Issue', 'Low Activator Score', 'RevPAR vs LY is pulling this below our standard (all other factors for Activator score are Green) - working with RVPS and RM to address'),
(get_hotel_id('Courtyard San Diego Little Italy'), get_company_id('Schulte Hospitality'), '2025-04-21', false, 'Issue', 'Needs more content POI for website, current ROI low Media', NULL),
(get_hotel_id('Courtyard Washington Meadow Lands'), get_company_id('Concord'), '2025-04-21', true, 'Issue', 'Low Activator Score', 'For CY Washington, they are having an issue in One Source where the system isn''t closing out RFP responses timely, even when the DOS has responded to the lead. Which is affecting that activator score. RVPS is aware, escalating it with Marriott.

Resposne from Group
Group Response Time is impacting the activator score - working with RVPS and the property team to address'),
(get_hotel_id('Element Nashville Vanderbilt West End'), get_company_id('Aimbridge'), '2025-04-21', true, 'Issue', 'Large drop in OTA production', NULL),
(get_hotel_id('Element Nashville Vanderbilt West End'), get_company_id('Aimbridge'), '2025-05-28', true, 'Tactic', 'Current tactics', 'Action Items
Audit brand.com for stale content
• Highlight shuttle service on HWS
Focus paid search efforts on high traffic
POl terms
Increase Google Search budget for May-
From $700 to $1200
• Implement MetaSearch Ads
Optimize on-page SEO for Events page
List meeting space on Eventcentive &
Peerspace
EMMA Campaign to target group
Review event schedule and setup additional
scheduled ad campaigns
Work with hotel for additional marketing
opportunities for events: promos, email
marketing, collateral
OTA:
• Content Scores:
• Expedia: 100%
• Booking: 100%'),
(get_hotel_id('Element Nashville Vanderbilt West End'), get_company_id('Aimbridge'), '2025-10-30', true, 'Issue', 'Marriott Activator Score', '71'),
(get_hotel_id('Element Nashville Vanderbilt West End'), get_company_id('Aimbridge'), '2025-10-30', true, 'Issue', 'Brand.com Index', '71'),
(get_hotel_id('Element Nashville Vanderbilt West End'), get_company_id('Aimbridge'), '2025-10-30', true, 'Issue', 'OTA', '60'),
(get_hotel_id('Embassy Suites by Hilton Memphis'), get_company_id('Apature'), '2025-05-27', true, 'Tactic', 'CogWheel Current Objectives', '• Strategic Observations #1: Improved Leveraging of Market Demand Generators & Location
Show up in search for the location, attractions and amenities through an omni-channel approach
online. Capturing what potential guests are really looking for when booking a hotel.

• Strategic Observations #2: Elevate your online reputation
Fine-tuning engagement on Online Travel Agencies (OTAs) and social media platforms is crucial
for improving the hotel''s online reputation. Utilizing these channels to tackle the easiest wins on
property can lead to increased rank and conversions.

• Strategic Observations #3: Consistency is needed in content strategy and storytelling
Consistency in content strategy and storytelling, including naming conventions, images, and
amenities, is essential for increased rank and conversions ultimately driving higher engagement
and bookings, in both organic and paid channels.'),
(get_hotel_id('Embassy Suites by Hilton Memphis'), get_company_id('Apature'), '2025-07-09', true, 'Issue', 'Brand.com is dropping', 'Our Brand.com performance is showing significant challenges:

- May saw initial decline in channel
- June experienced substantial drop of 15.1% (Index)
- Transient RevPAR Index down 9.7% (Index)
- Continuing negative trend into July with RevPAR versus last year down 20.7%'),
(get_hotel_id('EVEN Hotels Seattle - South Lake Union'), get_company_id('Corp IHG'), '2025-04-21', true, 'Issue', 'Has a negative brand.com RevPAR Growth + Lower b.com Index', NULL),
(get_hotel_id('Hampton by Hilton Inn & Suites Tallahassee Capitol - University'), get_company_id('McKibbon'), '2025-05-27', true, 'Issue', 'July Occ done -12.4 vs CS flat (vs LY)', NULL),
(get_hotel_id('Hampton Inn & Suites Charlottesville'), get_company_id('McKibbon'), '2025-05-10', true, 'Tactic', 'Follow up on room merchandising/unique value proposition and obtain photo quotes', 'Reaching out to photographer network to find next availability and pricing'),
(get_hotel_id('Hampton Inn & Suites Charlottesville'), get_company_id('McKibbon'), '2025-05-11', true, 'Tactic', 'Significant erosion for both brand.com and OTA channels
 • OTA RevPAR growth has dropped by -29% (March)
 • Brand.com has dropped by -9.5% (March)', 'Increased OTA advertising budget in May to boost visibility
 Submitted onsite SEO changes in April to improve brand.com visibility'),
(get_hotel_id('Hampton Inn & Suites Charlottesville'), get_company_id('McKibbon'), '2025-05-12', true, 'Tactic', 'Onsite SEO', 'Based on Peer Hotels, RevPAR YOY, not a concern'),
(get_hotel_id('Hampton Inn & Suites Memphis Germantown'), get_company_id('Apature'), '2025-04-21', true, 'Issue', 'Brand.com has issue in June', NULL),
(get_hotel_id('Hampton Inn & Suites Memphis Germantown'), get_company_id('Apature'), '2025-05-27', true, 'Tactic', 'CogWheel Current Objectives', 'Strategic Opportunity #1: Enhancing Unique Selling Propositions (USPs)
Emphasizing these additional USPs can differentiate the property from competitors and appeal to
specific target audiences like families and extended stay travelers.

Strategic Opportunity #2: Expanding on Missing Demand Generators
By promoting additional demand generators and geo targeting potential guests, the property can
attract a wider range of guests, including sports teams, college visitors, and shoppers

Strategic Opportunity #3: Improving Online Presence, Storytelling, and SEO
Increasing organic rankings on OTAs and the property''s visibility on multiple channels like social
media can drive more traffic and increase bookings through improved SEO'),
(get_hotel_id('Hampton Inn & Suites Memphis Germantown'), get_company_id('Apature'), '2025-06-17', true, 'Tactic', 'CogWheel apparently optimizing SEO efforts for Hilton website.', 'Timelines - Compressing Into 5 Month Window
• SEO: Completion by June 30
• KW Research
• Title Tags & Meta Descriptions
• Competitive Backlink Audit & Direction
• Content & Imagery: July - Aug
• Content adjustments on Hilton.com
• Image audit for quality, brand standards and improved rankings
• OTA: Sept - Oct
• Expedia
• Booking.com
• Local Listings - Nov - Dec
0 . Google Business Profile, TripAdvisor, Bing, Apple Maps, Facebook'),
(get_hotel_id('Hampton Inn & Suites New Orleans Canal St. French Quarter'), get_company_id('Aimbridge'), '2025-04-21', true, 'Issue', 'Needs more positive reviews post review wipe', NULL),
(get_hotel_id('Hampton Inn & Suites Tallahassee Capitol-University'), get_company_id('McKibbon'), '2025-05-31', true, 'Tactic', 'Continuing to monitor SEO', NULL),
(get_hotel_id('Hampton Inn Charlotte Uptown'), get_company_id('McKibbon'), '2024-09-30', true, 'Tactic', 'Google Paid Search Campaign', 'https://docs.google.com/presentation/d/1swh8UmxEjQZ4Wk3IMU4eT-e2rNsoxjzGVcunJn0AXK0/edit#slide=id.p'),
(get_hotel_id('Hampton Inn Charlotte Uptown'), get_company_id('McKibbon'), '2025-05-08', true, 'Tactic', 'Google Paid Search Campaign', 'Live and managed by Cogwheel Marketing
 Call scheduled on 5/9 to discuss performance and reporting moving forward'),
(get_hotel_id('Hampton Inn Charlotte Uptown'), get_company_id('McKibbon'), '2025-05-09', true, 'Tactic', 'SEO Linkbuilding', 'Completed training with DOS
 Monthly follow up scheduled on 5/9 (tentative date) to review progress'),
(get_hotel_id('Hampton Inn Charlotte Uptown'), get_company_id('McKibbon'), '2025-05-27', true, 'Issue', 'June Occ done -11 vs CS up 14% (vs LY)', NULL),
(get_hotel_id('Hampton Inn Savannah-Historic District'), get_company_id('McKibbon'), '2025-05-20', true, 'Tactic', 'SEO Linkbuilding', 'Completed training with DOS
 Monthly follow up scheduled on 5/26 to review progress'),
(get_hotel_id('Hampton Inn Savannah-Historic District'), get_company_id('McKibbon'), '2025-05-21', true, 'Tactic', 'Savannah Lodging Vanity Website', 'Monitoring and updating site as needed'),
(get_hotel_id('Hampton Inn Tampa Downtown'), get_company_id('McKibbon'), '2025-06-01', true, 'Tactic', 'SEO Linkbuilding', 'Completed training with DOS
 Monthly follow up scheduled on 5/8 to review progress'),
(get_hotel_id('Hampton Inn Tampa Downtown Channel District'), get_company_id('McKibbon'), '2025-05-27', true, 'Issue', 'June Occ done -23 vs CS down 20% (vs LY)', NULL),
(get_hotel_id('HAMPTON INN TAMPA DOWNTOWN CHANNEL DISTRICT'), get_company_id('McKibbon'), '2025-10-30', true, 'Issue', 'Brand.com Index', '83'),
(get_hotel_id('HILTON GARDEN INN ARLINGTON'), get_company_id('Aimbridge'), '2025-10-30', true, 'Issue', 'OTA Index', '65'),
(get_hotel_id('HILTON GARDEN INN ATLANTA PERIMETER'), get_company_id('Aimbridge'), '2025-10-30', true, 'Issue', 'Brand.com Index', '65'),
(get_hotel_id('Hilton Garden Inn Atlanta Perimeter Center'), get_company_id('Aimbridge'), '2025-04-21', true, 'Issue', 'Large drop in OTA production and erosion and Brand.com', NULL),
(get_hotel_id('Hilton Garden Inn Boise Downtown'), get_company_id('Aimbridge'), '2025-04-21', true, 'Issue', 'Large drop in OTA production.', NULL),
(get_hotel_id('Hilton Garden Inn Boise Downtown'), get_company_id('Aimbridge'), '2025-05-13', true, 'Issue', 'OTA production', 'The hotel is losing share and growth in the OTA channels, specifically weekdays.'),
(get_hotel_id('Hilton Garden Inn Boise Downtown'), get_company_id('Aimbridge'), '2025-06-11', true, 'Issue', 'Significant performance issues in July.', 'Hotel is significantly underperforming market growth (down vs. market up 16.7% occupancy), creating critical market share loss with -790 room night variance. Despite ADR improvement to $197, the property faces soft base business across government, contract, and group segments, with team expecting to "give away" rate gains by month-end. July presents particular challenges due to post-July 4th demand softness and reliance on low-rated group business ($60 ADR block)'),
(get_hotel_id('Hilton Garden Inn Boise Downtown'), get_company_id('Aimbridge'), '2025-06-11', true, 'Tactic', 'Aggressive Advanced Purchase Deployment.', 'Revenue Optimization Strategies

Team implementing 20% advance purchase promotions for July 2-28 to stimulate demand
Extending advance purchase strategy through August and September'),
(get_hotel_id('Hilton Garden Inn Charlotte Uptown'), get_company_id('McKibbon'), '2024-09-30', true, 'Tactic', 'Google Paid Search Campaign', 'Live and managed by Cogwheel Marketing - April 2025 Report'),
(get_hotel_id('Hilton Garden Inn Charlotte Uptown'), get_company_id('McKibbon'), '2025-05-06', true, 'Tactic', 'Google Paid Search Campaign', 'Live and managed by Cogwheel Marketing
 Call scheduled on 5/9 to discuss performance and reporting moving forward'),
(get_hotel_id('Hilton Garden Inn Charlotte Uptown'), get_company_id('McKibbon'), '2025-05-07', true, 'Tactic', 'SEO Linkbuilding', 'Completed training with DOSMonthly follow up scheduled on 5/9 (tentative date) to review progress'),
(get_hotel_id('Hilton Garden Inn Jacksonville Ponte Vedra Sawgrass'), get_company_id('McKibbon'), '2025-05-27', true, 'Issue', 'June Occ done -18 vs CS up 27.5% (vs LY)', NULL),
(get_hotel_id('Hilton Garden Inn Jacksonville/Ponte Vedra'), get_company_id('McKibbon'), '2025-05-19', true, 'Tactic', 'Continuing to monitor SEO', NULL),
(get_hotel_id('HOLIDAY INN EXPRESS NASHVILLE DOWNTOWN'), get_company_id('Aimbridge'), '2025-10-30', true, 'Issue', 'Brand.com Index', '54'),
(get_hotel_id('Holiday Inn Express Nashville Downtown Conf Ctr, an IHG Hotel'), get_company_id('Aimbridge'), '2025-04-21', true, 'Issue', 'Low Booking.com Score', '. Action Items
SEO Audit through IHG field marketing
complete April 10th
Requested HOD Screens to audit
Vanity Site: Working through complete
website refresh https://www.hiexndt.com/
Photo Updates: All pages
• Offer Updates
Meetings & Events Content Updates
Upload Virtual Tour
Review event schedule and setup additional
scheduled ad campaigns
Work with hotel for additional marketing
opportunities for events: promos, email
marketing, collateral
EMMA campaign showcasing new images

OTA:
• Content Scores:
Expedia: 100%
Booking: 100%
Agoda: 92%
Update room information
• Adjust room type photos'),
(get_hotel_id('Holiday Inn Express Nashville Downtown Conf Ctr, an IHG Hotel'), get_company_id('Aimbridge'), '2025-05-14', true, 'Issue', 'Facebook page access issue, with IHG unable to grant access and Facebook not resolving it on their end', 'The team is going to request to delete the old Warfen profile, and we utilize the new profile.'),
(get_hotel_id('Holiday Inn Express Nashville Downtown Conf Ctr, an IHG Hotel'), get_company_id('Aimbridge'), '2025-05-28', true, 'Tactic', 'Current tactics', '. Action Items
SEO Audit through IHG field marketing
complete April 10th
Requested HOD Screens to audit
Vanity Site: Working through complete
website refresh https://www.hiexndt.com/
Photo Updates: All pages
• Offer Updates
Meetings & Events Content Updates
Upload Virtual Tour
Review event schedule and setup additional
scheduled ad campaigns
Work with hotel for additional marketing
opportunities for events: promos, email
marketing, collateral
EMMA campaign showcasing new images
OTA:
• Content Scores:
Expedia: 100%
Booking: 100%
Agoda: 92%
Update room information
• Adjust room type photos'),
(get_hotel_id('Holiday Inn Express Savannah-Historic District'), get_company_id('McKibbon'), '2025-05-22', true, 'Tactic', 'We need a report on initiatives that goes beyond day-to-day e-commerce support
 Items such as geofencing for Hyundai facility, etc.
 We report back to Steven, per his request', 'Received approval to go live with Geofencing campaign
 Working on next steps to get campaign live'),
(get_hotel_id('Holiday Inn Express Savannah-Historic District'), get_company_id('McKibbon'), '2025-05-23', true, 'Tactic', 'Google Paid Search Campaign', 'Live and managed by Cogwheel Marketing
 Call scheduled on 5/9 to discuss performance and reporting moving forward'),
(get_hotel_id('Holiday Inn Express Savannah-Historic District'), get_company_id('McKibbon'), '2025-05-24', true, 'Tactic', 'SEO Linkbuilding', 'Completed training with DOS.
 Monthly follow up scheduled on 5/26 to review progress'),
(get_hotel_id('Holiday Inn Express Savannah-Historic District'), get_company_id('McKibbon'), '2025-05-25', true, 'Tactic', 'Savannah Lodging Vanity Website', 'Monitoring and updating site as needed'),
(get_hotel_id('Home2 Suites Tampa Downtown Channel District'), get_company_id('McKibbon'), '2025-06-02', true, 'Issue', 'Address declining brand.com performance since February', '"Brand.com OCC & RevPAR Index improved in April. Brand.com OCC Index continues to show growth through Q2
We will investigate brand.com traffic sources to see if there are additional opportunities to improve

Data filtered for transient only:"'),
(get_hotel_id('Home2 Suites Tampa Downtown Channel District'), get_company_id('McKibbon'), '2025-06-03', true, 'Tactic', 'SEO Linkbuilding', 'Completed training with DOS
 Monthly follow up scheduled on 5/8 to review progress'),
(get_hotel_id('Homewood Suites Salt Lake City Downtown'), get_company_id('Aimbridge'), '2025-05-14', true, 'Issue', 'Behind the set in Occ growth for July', 'Hotel at -47.6 vs the CS -33.7'),
(get_hotel_id('Homewood Suites Salt Lake City Downtown'), get_company_id('Aimbridge'), '2025-05-14', true, 'Issue', 'SkyWest production is dropping for the month of May and into June.', 'SkyWest demand is well below plan. Below is a short brief with source lines from the meeting.

What changed

Actual class size – last two classes checked in at 18 rooms.

"Sky West came in with 18 rooms."
"…now we're at 18."
Contracted versus blocked – contract still shows 70; we had already cut blocks to 35, then 30.

"The contract is 70… then we went down to 35…"
July class cancelled – no replacement volume.

"…they cancelled the July class…"
Shorter winter run – final class departs 3 Dec, not 23 Dec.

"Sky West checks out on December 3rd this year… last year they didn''t check out until December 23rd."
Why the drop – tighter upfront screening means fewer trainees and no mid-stay failures.

"They''re vetting their candidates clearly much better… when they were coming in at 48… five or eight failed and were sent home."
Actions already taken

Block washed – June/July block cut to 18 in GRO; matching cut coming in R&I.

"…we''ll go even… we''ll wash it in Grow…"
Future stance – team ready to chop further to 15 if next class stays small.

"I want to aggressively chop them to 15 and wait until they give us our production back."
Rate integrity – closed government rate on premium suites.

"We have government booking the ginormous double-queen-king rooms at 142. We''ve got to get that turned off."
Decisions needed

Reset standing block – cap future classes at 20 rooms (drop to 15 if next class again lands at 18).

Re-forecast P&L – remove roughly 2 250 room-nights (≈ USD 350 k at 155 USD ADR).

Renegotiate contract – seek sliding guarantee: pay only for rooms above 20 per night.

Transcript driver: "…we continue to be left holding the bag…"

Replace lost base – open controlled OTA discounts around 4 Jul and 24 Jul (Pioneer Day).

"24th of July is a very large holiday in Utah… lots of parades, rodeos…"
Next steps

Revenue & Sales finalise block wash in both systems by 17 May.

Finance delivers revised forecast by 24 May.

GM/Sales to call SkyWest procurement week of 26 May to discuss volume commitment.

Ops adjusts crew-related staffing from July onward.'),
(get_hotel_id('Homewood Suites Salt Lake City Downtown'), get_company_id('Aimbridge'), '2025-05-28', true, 'Tactic', 'Current tactics', '• Action Items
• Audit SEO
Audit brand.com content
• Inquiring about photo edits to
remove hot tub
• Scheduled ads for need dates
OTA:
• Content Scores:
• Expedia: 100%
• Booking: 100%
• Agoda: 90%
• Adjust Room & Property
Photos
Update room info
• Update facilities'),
(get_hotel_id('Hyatt House Columbus Osu / Short – North'), get_company_id('Concord'), '2025-07-25', true, 'Tactic', 'Strategic Alignment: Setting up regular commercial strategy calls (Dan''s team + Christine + new RM + commercial team)', 'Strategic Alignment: Setting up regular commercial strategy calls (Dan''s team + Christine + new RM + commercial team)'),
(get_hotel_id('Hyatt House Columbus Osu / Short – North'), get_company_id('Concord'), '2025-07-25', true, 'Tactic', 'Traffic Investigation: Christine''s team to analyze March traffic decline (SEO changes? Traffic pattern shifts?)', NULL),
(get_hotel_id('Hyatt House Columbus Osu / Short – North'), get_company_id('Concord'), '2025-07-25', true, 'Issue', 'Website Traffic Decline: Material drop in website traffic starting March (needs investigation)', NULL),
(get_hotel_id('Hyatt House Nashville Downtown Convention Center'), get_company_id('Schulte Hospitality'), '2025-04-21', true, 'Issue', 'Perpetually struggling with Brand.com contribution.', NULL),
(get_hotel_id('HYATT HOUSE NASHVILLE DOWNTOWN CONVENTION CENTER'), get_company_id('Schulte Hospitality'), '2025-10-30', true, 'Issue', 'Brand.com Index', '42'),
(get_hotel_id('Hyatt House Tallahassee Capitol – University'), get_company_id('McKibbon'), '2025-05-27', true, 'Issue', 'June Occ done -20 vs CS up 22.7% (vs LY)', NULL),
(get_hotel_id('Hyatt House Tallahassee Capitol-University'), get_company_id('McKibbon'), '2025-05-30', true, 'Tactic', 'Continuing to monitor SEO', NULL),
(get_hotel_id('NEW HAVEN HOTEL NEW HAVEN'), get_company_id('Aimbridge'), '2025-10-30', true, 'Issue', 'Brand.com Index', '49'),
(get_hotel_id('Renaissance Raleigh North Hills'), get_company_id('Concord'), '2025-04-21', true, 'Issue', 'Low Review Score, Low ROI for Band Spend', 'For RHR Raleigh, Melissa mentioned that the start of the renovation on 3/17 (or Beautification process, as she likes to put it) was part of that reputation management hit in March. They''ll probably have some rollercoaster weeks depending on the work being done, but they are highly focused on minimizing impact.

Respons from Managers
The last 30-day average is at 4.4 - overall positive guest service trend. Melissa is a true pro; she''ll rally the team and address any GSS issues. I''ll shoot her a note on the March scores and make her aware of the focus.'),
(get_hotel_id('Renaissance Raleigh North Hills'), get_company_id('Concord'), '2025-07-25', true, 'Tactic', 'Raleigh Renaissance photo shoot scheduling for newly renovated tag', 'Raleigh Renaissance photo shoot scheduling for newly renovated tag'),
(get_hotel_id('Residence Inn Charlottesville Downtown'), get_company_id('McKibbon'), '2025-04-21', true, 'Issue', 'Low Activator Score', NULL),
(get_hotel_id('Residence Inn Charlottesville Downtown'), get_company_id('McKibbon'), '2025-05-13', true, 'Tactic', 'Low Marriott activator score of 60
 • This needs improvement to reach optimal performance levels', 'RMs are working with TeDra/Lisa on action plans and have provided them those specific plans during monthly P&L Calls and Property Visits'),
(get_hotel_id('Residence Inn Charlottesville Downtown'), get_company_id('McKibbon'), '2025-05-14', true, 'Tactic', 'Market shifting and may need more focus on OTAs', 'Increased OTA advertising budget in May to boost visibility'),
(get_hotel_id('Residence Inn Charlottesville Downtown'), get_company_id('McKibbon'), '2025-05-15', true, 'Tactic', 'Onsite SEO', 'Changes went live on Brand.com in January 2025

 Keyword Visibility Increases:
 "Downtown" - Overall increase last 6 months, now at 54% visibility
 "UVA" - Link-building will help increase authority and visibility for site. Fernando reviewed report with Brooke.'),
(get_hotel_id('Residence Inn Denver City Center'), get_company_id('Aimbridge'), '2025-04-21', true, 'Issue', 'Large drop in OTA and brand.com production', NULL),
(get_hotel_id('Residence Inn Denver City Center'), get_company_id('Aimbridge'), '2025-05-28', true, 'Tactic', 'Current tactics', 'Action Items
Audit SEO
Add to Agoda
Additional scheduled ads targeting need dates
• Audit brand.com content
• Images
• Room Type Descriptions
• Offers
Audit OTA images
Booking
Agoda
Google My Business
• TripAdvisor
OTA:
• Content Scores:
Expedia: 99%
Room Amenity
• Booking: 100%'),
(get_hotel_id('Residence Inn Philadelphia Great Valley/Malvern'), get_company_id('Raines'), '2025-04-21', true, 'Issue', 'Low Booking.com Score, Low Review Score, Low Activator Score', NULL),
(get_hotel_id('Residence Inn Secaucus | Meadowland'), get_company_id('Concord'), '2025-04-21', true, 'Issue', 'Low Activator Score', 'Group Response Time and RevPAR vs LY are impacting the activator score - working with RVPS and the property team to address'),
(get_hotel_id('Residence Inn Secaucus | Meadowland'), get_company_id('Concord'), '2025-07-25', true, 'Issue', 'Need Dates Identified', 'Need Dates Identified: November and December from brand.com perspective
OTA Need Dates: August, November, and December gaps from OTA perspective
Specific Gap Details: Weekday Expedia share loss in August (not weekend)
December Challenges: Need dates showing discount and qualified rate gaps
Need for media boost given current performance challenges'),
(get_hotel_id('Residence Inn Tampa Downtown'), get_company_id('McKibbon'), '2025-06-04', true, 'Tactic', 'Decline in transient production in April and May', 'Increased OTA advertising budget in May to boost visibility'),
(get_hotel_id('Residence Inn Tampa Downtown'), get_company_id('McKibbon'), '2025-06-05', true, 'Tactic', 'SEO Linkbuilding', 'Completed training with DOS
 Monthly follow up scheduled on 5/8 to review progress'),
(get_hotel_id('Staybridge Suites - South Lake Union'), get_company_id('Corp IHG'), '2025-05-15', true, 'Issue', 'State bridge weekends have declined since November of 2024 and continue to be a major concern.', NULL),
(get_hotel_id('Tempo Savannah'), get_company_id('McKibbon'), '2025-05-26', true, 'Tactic', 'SEO Linkbuilding', 'Adding to next monthly follow up with DOS, scheduled on 5/26
 We will share links we want to immediately establish once hotel website goes live'),
(get_hotel_id('Tempo Savannah'), get_company_id('McKibbon'), '2025-05-27', true, 'Tactic', 'Onsite SEO', 'Research and strategy in development'),
(get_hotel_id('Tempo Savannah'), get_company_id('McKibbon'), '2025-05-28', true, 'Tactic', 'Savannah Lodging Vanity Website', 'Monitoring and updating site as needed'),
(get_hotel_id('Tempo Savannah'), get_company_id('McKibbon'), '2025-05-29', true, 'Tactic', '', NULL),
(get_hotel_id('THE LITTLE ITALY HOTEL IN DOWNTOWN SAN DIEGO'), get_company_id('Schulte Hospitality'), '2025-10-30', true, 'Issue', 'Brand.com Index', '45'),
(get_hotel_id('TOWNE PLACE SUITES SAN DIEGO AIRPORT LIBERTY STATION'), get_company_id('Inter Mountain'), '2025-10-30', true, 'Issue', 'OTA Index', '71'),
(get_hotel_id('HAMPTON INN & SUITES LADY LAKE/THE VILLAGES'), get_company_id('McKibbon'), '2025-10-31', true, 'Tactic', 'Add sales Resources', 'I spoke to Bruce.
He will be adding multiple sales resources to the village sales team. These additional resources will be at McKibbon''s expense.

Robert will be there next week, selling, not supervising. Post next week, there will be other sales resources that Lynn and Kari well communicate. We did not get into specifics on who or how many.

Please follow up with Stacey. Get the full plan and let me know if acceptable

I would like some regular update on bookings at least every 30 days. The commitment from Bruce was for 90 days. If at the end of 60 days, there is no real progress. I want to proactively asked to extend the ask.

Please take the leave from here

Steve
Steven Nicholas
Noble Investment Group | Managing Principal
2000 Monarch Tower | 3424 Peachtree Road, NE | Atlanta, Georgia 30326
office | 404.832.3820
steve.nicholas@nobleinvestment.com |www.nobleinvestment.com'),
(get_hotel_id('Westin Reston Heights'), get_company_id('Concord'), '2025-04-21', true, 'Issue', 'Low Booking.com Score', NULL);

-- Drop helper functions
DROP FUNCTION IF EXISTS get_hotel_id(TEXT);
DROP FUNCTION IF EXISTS get_company_id(TEXT);
