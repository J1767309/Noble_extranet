#!/usr/bin/env python3
"""
Import script for hotel partner notes from the 2025 Mid-Year Review Meeting document
"""

import re

def escape_sql(text):
    """Escape single quotes for SQL"""
    if not text:
        return None
    return text.replace("'", "''")

def format_list(items):
    """Format list items as HTML"""
    if not items:
        return None
    html = "<ul>"
    for item in items:
        html += f"<li>{escape_sql(item.strip())}</li>"
    html += "</ul>"
    return html

def format_text(text):
    """Convert text with bullets to HTML"""
    if not text:
        return None

    # Replace bullet points with list items
    lines = text.split('\n')
    result = []
    in_list = False

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check if line starts with bullet
        if line.startswith('•') or line.startswith('-'):
            if not in_list:
                result.append('<ul>')
                in_list = True
            # Remove bullet and add as list item
            clean_line = re.sub(r'^[•\-]\s*', '', line)
            result.append(f'<li>{escape_sql(clean_line)}</li>')
        else:
            if in_list:
                result.append('</ul>')
                in_list = False
            result.append(f'<p>{escape_sql(line)}</p>')

    if in_list:
        result.append('</ul>')

    return ''.join(result)

# Hotel data extracted from the document
hotels_data = [
    {
        'hotel_name': 'Renaissance Raleigh',
        'review_period': '2025 Mid-Year',
        'review_date': '2025-08-20',
        'keys_to_success': format_text("""
• Increase special corporate mix from 16.1% to 19.2% YOY at the rate of $258.31 and increase of $21 YOY. YTD mix at 24%, up 1773 rooms and $13 ADR, $260
• Increase group mix from 32.8% to 33.9% with $18 lift in ADR YOY. YTD mix at 29.7%, down 1013 rooms and up $11 ADR, $233
• Increase Retail room nights by over 2000 and ADR by $8. YTD Mix 22%, down 2422 rooms and up $26 ADR, $330
• Improve weekend share Up 5pts, 142 vs 137
• GOP – creative scheduling for housekeeping during hockey season, focus on controllables
        """),
        'new_supply': format_text("""
Downtown:
• Hyatt House Raleigh Downtown, 149 rooms, under construction, 92 rooms w/kitchens, opened October 2024
• Tempo/Homewood Suites Raleigh Downtown, CN Hotels, 250 rooms (tempo 139/HWS 111), opened November 2024, McKibbon
• The Oberlin Hotel, a Hilton Curio Collection Raleigh, 153, December 2025
• Holiday Inn, 179 rooms, 2025, converting to Hotel Indigo
• Moxy Raleigh Downtown, 169 rooms, 2027
• Omni Hotel, 600 rooms, 50k sq ft meeting space, 2027
Raleigh-Durham Airport/Brier Creek:
• Westin Raleigh-Durham Airport Brier Creek, 236 rooms, March 2023, CMC Hotels
• Closed – Hyatt Place 2022, Residence Inn 2023 and Doubletree 2022
        """),
        'market_updates': format_text("""
North Hills Main District Expansion:
• One North Hills Tower – 10 story 266k sq ft office, open – JT International, CHG Healthcare, HNTB, Jewelers Mutual Group, Raymond James & Associates
• NHX Creative Office – 5 story 80K sq ft, opened 2024 – PWC
• Business Booked – PWC, JTI, HNTB, Jewelers Mutual, CHG
• Retail and restaurants – Restoration Hardware, J. Crew, True Food, Ruth's Chris, Rothy's and Tecovas
Park District:
• The Strand – broke ground Q1 2025, 362 residences, 9k retail, open summer 2027
The Exchange:
• 1000 Social fully retailed fully leased
• Corporate tenants include Morgan Stanley, Whitley Law, Summit Design and Engineering
        """),
        'str_revenue_market': format_text("""
• 2025 Budgeted market growth at 3.2%, Jan-Jun budget growth 2.9%
• Through June, market RevPAR was down 0.4%, occ -2.8% and ADR +2.5% - all the decline was in June
• Growth Jan-May +3.4%, June -17.4%
• July market down 4.1% MTD
• Total Market group down 21% YoY, convention pace down 14%, citywide down 1%
• Weekends down 39%
• Aug – Dec, Market occ pace down 9.4%
        """),
        'str_revenue_hotel': format_text("""
• 2025 Budgeted hotel growth 2.7%, Jan-Jun budget growth 3%
• Through June, hotel RevPAR was up 4.3%, occ +0.2% and ADR +4.1%. share +7.1pts
• Growth Jan – May 5%, June +1%
• July hotel RevPAR down 8% MTD – all weekend loss. Weekday Index 166.8, Weekend index 94.7
• Aug-Dec, Hotel occ pace up 2.1%
• July RevPAR Index: 148.7 (-4.1%), Aug RevPAR Index: 129.1 (+13%)
        """),
        'accounts_top': format_text("""
Top (up 1773rn, $13 ADR):
• Deloitte 900 @ $242, LY 200 @ $236, up 700 rooms
• Silicon Valley 676 $263 LY 351 $45, up 325 @ $18
• First Citizens 479 @ $255, LY 905 $246, down 426 and up $8
• PWC 471 @ $303, LY 234 @ $276, up 237 @ $28
• KPMG 464 @ $244, LY 102 @ $239, up 362 @$5
        """),
        'accounts_target': format_text("""
Target accounts being pursued in the North Hills area
        """),
        'expense_gop_update': format_text("""
• 2025: 52.5% YTD vs proforma 46.2%
• Group commissions down $36k to budget, $40k to LY
• Housekeeping down $12k/0.36 – contract labor
• Laundry up 0.7/$23k to budget
• F&B profit 42% vs 45%, down to LY and budget
• Cancellation/Attrition up $113k to budget, $40k to LY – Hubbell
• S&M – savings in wages, loyalty and cluster
• VS proforma: Rooms $300k, F&B $200k
        """),
        'capital': format_text("""
• VTAC Replacement $34k – purchased 5 $20k
• GPNS $103k
• Ballroom RTU $160k
• Ice machine $9k
• Tub refinish $6k
• Security Cameras/Panic Button $15k
• Digital Signage/Reader Boards $60k
• Key Cabinet $8k
        """)
    },
    {
        'hotel_name': 'Hyatt House Raleigh',
        'review_period': '2025 Mid-Year',
        'review_date': '2025-08-20',
        'keys_to_success': format_text("""
• NO Navy groups for high demand months Feb-Apr, allowing us to grow ADR share in those months
• Navy groups have a higher rate with per diem increase, $125 to $131
• Navy 1743 rooms LY $125, TY 823 $131
• Adjust extended stay tiers based on seasons and demand – Retail roomnights down 2417 to LY, but up $24.45
• Limit weekday group and increase rates during high demand periods
• Solicit and add new tenants in North Hills
• Weekend business – groups or discount
• GOP – reduce relocation costs and maintenance costs
        """),
        'new_supply': format_text("""
Same as Renaissance Raleigh - Downtown and Airport area supply
        """),
        'market_updates': format_text("""
Same as Renaissance Raleigh - North Hills development
        """),
        'str_revenue_market': format_text("""
• 2025 Budgeted market growth at 2.6%, Jan-Jun budget growth 2.9%
• Through June, market RevPAR was down 5.7%, occ -3.3% and ADR -2.5%
• This set only saw growth in March and May, all other months declined YoY
• Ext stay Amazon block in Market – 15 rooms 1/29-4/18
• July market is down 10.8% MTD
• Aug – Dec occ pace down 12.8%, decline in all segments
        """),
        'str_revenue_hotel': format_text("""
• 2025 Budgeted hotel growth 2.3%, Jan-Jun budget growth 3.4%
• Through June, hotel RevPAR was up 5.5%, occ -2.8% and ADR up 8.5% - share up 19.1pts
• Hotel's growth is all in ADR, did not take Navy over high demand periods and improved extended stay strategy
• July hotel was down 4.7% MTD – losing share over weekends, lack of group
• Aug-Dec hotel occ pace down 20.2%
• July RevPAR Index: 172.3 (+6.8%), Aug RevPAR Index: 150 (0%)
        """),
        'accounts_top': format_text("""
Top (up 637 rn @ $10):
• First Citizens 827 @ $231, up 281
• Advance Auto 538 @ $217, up 109
• Silicon Valley 251 @ $237, up 109
• Gilead 283 @ $218, up 178
• Novo Nordisk 150 @ $210, up 1
        """),
        'accounts_target': format_text("""
• Messer Construction – rate agreement sent
• Imangi Studios – rate agreement sent
• Sysdig – new company moving to One North Hills building starting August 1st
• Aon – leasing office space in North Hills starting August
• Apex Systems – leasing office space in North Hills starting August
• Brown Advisory – leasing office space in North Hills starting August
• LineSight – leasing office space in North Hills starting August
        """),
        'expense_gop_update': format_text("""
• 2025: 57.2% vs 55% budget and 56.7% LY, proforma at 52.3%
• ADR up $11.78 to budget, $17.5 to LY
• Vacant positions LY – Sales Coordinator $24k and Maintenance $33k
• Laundry profit down $25k to LY – Crabtree
• Group commissions up $10k to budget, $12k to LY
• Housekeeping/contract down 2.00/
• F&B Profit up $14k to budget, up $42k to LY
        """),
        'capital': format_text("""
• Elevator Panels $12k
• Lock replacement $77k
• GPNS $69k
        """)
    },
    {
        'hotel_name': 'SpringHill Suites OSU',
        'review_period': '2025 Mid-Year',
        'review_date': '2025-08-20',
        'keys_to_success': format_text("""
• Increase group rooms YOY and increase share – YTD group share is down 150 TY vs 162 LY
• Increase Retail segment - up 304rn, $4 ADR, 2.4% mix, index up 13pts
• Competitively price Wexner medical and OSU to ensure we are getting fair share
• Protect football weekends - maximum group size for fall weekends is 10 rooms until schedule is released
• Partner with Hyatt House to saturate OSU departments and house larger groups
• GOP – reduce labor – contract, laundry and bar. Improve parking and meeting revenue
        """),
        'new_supply': format_text("""
• No New Supply
• Homewood Suites – undergoing renovation
        """),
        'market_updates': format_text("""
OSU expansions:
• Wexner Medical Inpatient Tower – opening 2026, 820 fully private patient rooms
• Carmenton - home to new collaborations, expanding to include residential areas, green spaces, connector trails, restaurants
• Pelotonia Research Center - state-of-the-art laboratory building
• Energy Advancement and Innovation Center
• OSU Wexner Medical Center James Outpatient Care – Central Ohio's first proton therapy treatment
• Andelyn Biosciences Inc. - massive biotech manufacturing facility
• Battery Cell R&D Center to open Sept 2025
• 2025 OSU Football – 7 games vs 8 in 2024
        """),
        'str_revenue_market': format_text("""
• 2025 Budgeted market growth at 1.7%, Jan-Jun budget growth 3.9%
• Through June, market RevPAR was up 3.8%, occ +3.2% and ADR +0.6%
• July 2025 MTD market up 2.7%
• Aug-Dec occ pace down 10%
• All segments down YoY – negotiated down 23.2%, group down 9.1%
        """),
        'str_revenue_hotel': format_text("""
• 2025 Budgeted hotel growth 1.7%, Jan-Jun budget growth 4.8%
• Through June, hotel RevPAR was up 0.75%, occ flat and ADR up 0.74%
• Exceeding proforma share (115.2%), running 117% YTD June. Running #1 in the set
• July 2025 MTD hotel down 2.3% - driven by occupancy declines over July 4th
• Aug-Dec hotel occ pace +0.6%
• July RevPAR Index: 108.6 (-4.95), Aug RevPAR Index: 115.8 (+4.3)
        """),
        'accounts_top': format_text("""
Focus on Wexner Medical Center and OSU business
        """),
        'accounts_target': format_text("""
OSU departments and medical center related business
        """),
        'expense_gop_update': format_text("""
• YTD GOP: 38.3% margin, 2025 proforma at 46.3%
• Continue to reduce contract labor – POR is down more than $5.00 to 2023
• Grew GOP 3pts in 2024, 3pts in 2023, pushing for another 3 in 2025
• Focus on getting GOP to proforma
        """),
        'capital': format_text("""
No major capital items listed
        """)
    },
    {
        'hotel_name': 'Courtyard Reading',
        'review_period': '2025 Mid-Year',
        'review_date': '2025-08-20',
        'keys_to_success': format_text("""
• Retail growth – High level focus on making sure retail is always at the correct price point – pace up 38% Aug-Dec
• Negotiated share – need to shift lost accounts back from set, Aug Dec index 77
• Post renovation share improvement, Apr-June index 102.6
• ADR- Growing ADR YOY was a first half focus and continues to be a focus for the remainder of the year
• Group recovery after renovation disruption
        """),
        'new_supply': format_text("""
• No new supply
• Completed renovations Q1 2025
        """),
        'market_updates': format_text("""
• Market has gone backwards since 2022
• 2022 market RevPAR was at $87.70, 2024 finished at $86.18 and 2025 YTD June is at $81.23
• Market is down YTD June vs LY (-3.5%), down 0.8% in occupancy and down 2.8% in rate
        """),
        'str_revenue_market': format_text("""
• Budgeted 2025 to grow 1.9%. Original Proforma had 2025 growing 3%
• 2025 Proforma 112.07, budgeted 87.79 and YTD actual is at 81.23
• Market is down YTD June vs LY (-3.5%). Down 0.8% in occupancy and down 2.8% in rate
• Running 3 month is down (-2.3%). Down 0.6% in occupancy and down 1.8% in rate
        """),
        'str_revenue_hotel': format_text("""
• Hotel is achieving proforma share but not budgeted share
• Exceeding proforma share, 108.8% in 2024. Proforma had a 100
• 2025 proforma share 100, YTD 99.5, R12 102.9
• Renovation and water leak share loss, Q1 share loss -26.2pts, index 94.6
• Post renovation, Apr-June, -3.3pts, index 102.6
• Group Down 790 RNs YOY
        """),
        'accounts_top': format_text("""
Focus on recovering accounts lost during renovation
        """),
        'accounts_target': format_text("""
Need to shift lost accounts back from competitive set
        """),
        'expense_gop_update': format_text("""
• GOP – running a 40.7% margin YTD June, proforma at 50.6%
• Market rates need to improve
• $10k in renovation expenses being reimbursed
• Focus is getting rooms labor in line and improving F&B profit margins
        """),
        'capital': format_text("""
• Completed renovations Q1
• Water leak repairs
        """)
    },
    {
        'hotel_name': 'Courtyard Settlers Ridge',
        'review_period': '2025 Mid-Year',
        'review_date': '2025-08-20',
        'keys_to_success': format_text("""
• Maintain GOP after Hampton Inn sale
• Labor model adjustments with Concord
• Shuttle service changes
        """),
        'new_supply': format_text("""
• Hampton Inn in set was sold
        """),
        'market_updates': format_text("""
• Proforma miss is market driven
• 2025 Market RevPAR proforma $72.59, YTD June $64.28
• Budgeted 1.2% growth, proforma growth 5.1% and 2024 growth was only 2.1%
        """),
        'str_revenue_market': format_text("""
• 2025 Market RevPAR proforma $72.59, YTD June $64.28
• Budgeted 1.2% growth, proforma growth 5.1%
• 2024 growth was only 2.1%
        """),
        'str_revenue_hotel': format_text("""
• Exceeded 2024 proforma share by 1pt (128.5)
• Exceeding 2025 share (129.7) at 134.4 YTD
• YTD GOP is at 40.2%, YTD Budget is 40.6% and 2025 proforma 43.9%
        """),
        'accounts_top': format_text("""
Not specified
        """),
        'accounts_target': format_text("""
Not specified
        """),
        'expense_gop_update': format_text("""
• YTD GOP at 40.2%, YTD Budget 40.6%, 2025 proforma 43.9%
• With sale of Hampton Inn, worked with Concord to make changes to labor model and shuttle service to maintain GOP
        """),
        'capital': format_text("""
• Completed renovations Q1
        """)
    },
    {
        'hotel_name': 'Residence Inn Philadelphia Malvern',
        'review_period': '2025 Mid-Year',
        'review_date': '2025-08-20',
        'keys_to_success': format_text("""
• Grow negotiated segment by targeting Vanguard, FM Global, Phillips, Saint Gobain, Balfour Beatty, Ellucian, Johnson & Johnson, Crane and Endo
• 2025 YTD Negotiated RGI at 211 (target 206+)
• Increase group average 40-50 rooms each month with $1-2 ADR increase
• Focus on Weekend Pricing Strategies and active Discounts and Package Promos
• Extended Stay base at right rate – ALE, CRS, Cedgwick and Ingenovis
• Labor Control is key - must keep labor slim with rising wages
        """),
        'new_supply': format_text("""
• No New Supply
• Courtyard Renovation started September 2024, finish early March
• Hampton and Doubletree in set, for sale
        """),
        'market_updates': format_text("""
• Vanguard purchased office building, can hold up to 1,700 employees. Currently 300 employees
• Endo out of bankruptcy, merged with Mallinckrodt, HQ in UK in April 2025
• Amazon/Ring – Office renovated, 3-day week office mandate
• Saint-Gobain, Balfour Beatty and Lincoln Financial issue 2 and 3-day office mandates effective 2025
• QVC/Home Shopping Network – Relocating HQ to West Chester from FL
• 2025 Club World Cup – Philadelphia matches June 16-26
• 2026 FIFA World Cup – Philadelphia matches June 14-27
        """),
        'str_revenue_market': format_text("""
• YTD market RevPAR down 9.5% to 2024, occupancy down 5.2% and ADR down 4.6%
• Q1 market RevPAR down 10.2% over LY
• Q2 Market RevPAR down 4.5%, occupancy down 4% and ADR down 1%
• 2025 Remainder of the Year occupancy pace is up 2.1%
• This is our worst market to recover. 2019 Market RevPAR $89.64 vs YTD 2025 $62.88
        """),
        'str_revenue_hotel': format_text("""
• YTD hotel RevPAR is flat YoY while share grew 10.6%. Occupancy up 3.9% and ADR up 6.5%
• Q1 hotel RevPAR up 7.1%, share up 19.3%
• Q2 hotel RevPAR down 2.9%, share up 1.7pts
• 2025 Remainder of the Year Occupancy Pace is +2%
• We have grown share by 14.5 pts YTD to 150.7%
        """),
        'accounts_top': format_text("""
Top Accounts YTD 2025:
• Vanguard 820 @ $165, -177 YoY
• Saint Gobain 684 @ $118, +254 RNs
• Deloitte 467 @ $137, +183 RNs
• Johnson and Johnson 151 @ $151, -185 YoY
• FM Global 18 @ $172, -195 YoY
• Siemens 301 @ $140, +186 YoY
• Endo 101 @ $176, -58 YoY
• EY 350 @ $147, +329 YoY
        """),
        'accounts_target': format_text("""
Corporate:
• AKUVO – Transient and Group (Software company)
• QVC – Relocating HQ from FL to Malvern
• Keeler – Local Office receives travel from UK
• IFM Efector – Local Office receives travel from German
• Vanguard and Affiliates
• Consultants – PwC, Accenture, Deloitte
• People's Light Theater: 25 @ $107, +172 YoY – New Account
        """),
        'expense_gop_update': format_text("""
• YTD GOP: -0.9pt to budget and -2.3 pts to LY. Forecast GOP 37.1%, -0.7 pts to budget
• YTD Rooms Labor @ $15.03 POR vs budget $15.19, and vs LY $14.13
• Total Payroll YTD 2025 @ $28.14 vs budget $27.45, and vs LY $26.19
• GM vacant through Jan to early May 2024
• Model is slim. Removed contract labor and offset wage growth with light housekeeping service
        """),
        'capital': format_text("""
• Guestroom Ceiling Patch and Repair post leak repairs (22 Rooms)
• Roof Hack Leak – Repair
• Pool Heater – EOL, replacement
• Foundation Crack Monitoring
• Marriott GPNS Upgrade – Quotes Received but on hold
        """)
    }
]

# Generate SQL INSERT statements
print("-- Import partner notes data from 2025 Mid-Year Review Meeting")
print("-- Generated from: 2025 Mid Year Review Meeting Notes Master Final Consolidated 8-20.docx")
print()

for i, hotel in enumerate(hotels_data):
    print(f"-- Hotel {i+1}: {hotel['hotel_name']}")
    print("INSERT INTO public.hotel_partner_notes (")
    print("    hotel_name,")
    print("    review_period,")
    print("    review_date,")
    print("    keys_to_success,")
    print("    new_supply,")
    print("    market_updates,")
    print("    str_revenue_market,")
    print("    str_revenue_hotel,")
    print("    accounts_top,")
    print("    accounts_target,")
    print("    expense_gop_update,")
    print("    capital")
    print(") VALUES (")
    print(f"    '{escape_sql(hotel['hotel_name'])}',")
    print(f"    '{escape_sql(hotel['review_period'])}',")
    print(f"    '{hotel['review_date']}',")

    fields = ['keys_to_success', 'new_supply', 'market_updates', 'str_revenue_market',
              'str_revenue_hotel', 'accounts_top', 'accounts_target', 'expense_gop_update', 'capital']

    for idx, field in enumerate(fields):
        value = hotel.get(field)
        is_last = idx == len(fields) - 1
        comma = '' if is_last else ','

        if value:
            print(f"    '{value}'{comma}")
        else:
            print(f"    NULL{comma}")

    print(");")
    print()
