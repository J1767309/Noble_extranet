#!/usr/bin/env python3
"""
Script to generate SQL migration for importing hotel top accounts data from Excel
"""
import pandas as pd
import re

# Read the Excel file
excel_file = '/Users/johnjimenez/Library/CloudStorage/Dropbox/Noble Investment Group/Noble Projects/2026 Budget/MicKibbon/2026_accounts.xlsx'
df = pd.read_excel(excel_file, sheet_name='Accounts')

# Clean column names
df.columns = ['hotel', 'account_type', 'account_name', 'commentary']

# Parse the commentary field for Top accounts
def parse_top_account_commentary(commentary):
    """Parse the structured commentary for Top accounts"""
    if pd.isna(commentary):
        return None, None, None, None, ''

    commentary = str(commentary)

    # Extract RNs Sold Thru Oct 2025
    rns_sold_match = re.search(r'RNs Sold Thru Oct 2025:\s*(\d+)', commentary)
    rns_sold = int(rns_sold_match.group(1)) if rns_sold_match else None

    # Extract ADR 2025
    adr_2025_match = re.search(r'ADR 2025:\s*\$(\d+)', commentary)
    adr_2025 = float(adr_2025_match.group(1)) if adr_2025_match else None

    # Extract RNs Forecasted 2026
    rns_forecast_match = re.search(r'RNs Forecasted 2026:\s*(\d+)', commentary)
    rns_forecast = int(rns_forecast_match.group(1)) if rns_forecast_match else None

    # Extract ADR 2026
    adr_2026_match = re.search(r'ADR 2026:\s*\$?(\d+)', commentary)
    adr_2026 = float(adr_2026_match.group(1)) if adr_2026_match and adr_2026_match.group(1) != '0' else None

    # Extract Comments
    comments_match = re.search(r'Comments:\s*(.+)$', commentary)
    comments = comments_match.group(1).strip() if comments_match else ''

    return rns_sold, adr_2025, rns_forecast, adr_2026, comments

def parse_target_account_commentary(commentary):
    """Parse the commentary for Target accounts"""
    if pd.isna(commentary):
        return None, ''

    commentary = str(commentary)

    # Extract Segment Type
    segment_match = re.search(r'Segment Type:\s*([^;]+)', commentary)
    segment_type = segment_match.group(1).strip() if segment_match else None

    # Extract Commentary
    commentary_match = re.search(r'Commentary:\s*(.+)$', commentary)
    commentary_text = commentary_match.group(1).strip() if commentary_match else commentary

    return segment_type, commentary_text

def escape_sql_string(s):
    """Escape single quotes in SQL strings"""
    if s is None or pd.isna(s):
        return None
    return str(s).replace("'", "''")

# Generate SQL statements
sql_statements = []

for _, row in df.iterrows():
    hotel = escape_sql_string(row['hotel'])
    account_type = escape_sql_string(row['account_type'])
    account_name = escape_sql_string(row['account_name'])

    if account_type == 'Top':
        rns_sold, adr_2025, rns_forecast, adr_2026, comments = parse_top_account_commentary(row['commentary'])

        sql = f"""INSERT INTO public.hotel_top_accounts (hotel_name, account_name, account_type, rns_sold_2025, adr_2025, rns_forecasted_2026, adr_2026, segment_type, status, comments) VALUES (
    '{hotel}',
    '{account_name}',
    'Top',
    {rns_sold if rns_sold else 'NULL'},
    {adr_2025 if adr_2025 else 'NULL'},
    {rns_forecast if rns_forecast else 'NULL'},
    {adr_2026 if adr_2026 else 'NULL'},
    NULL,
    'Active',
    {f"'{escape_sql_string(comments)}'" if comments else 'NULL'}
);"""

    else:  # Target
        segment_type, commentary = parse_target_account_commentary(row['commentary'])

        sql = f"""INSERT INTO public.hotel_top_accounts (hotel_name, account_name, account_type, rns_sold_2025, adr_2025, rns_forecasted_2026, adr_2026, segment_type, status, comments) VALUES (
    '{hotel}',
    '{account_name}',
    'Target',
    NULL,
    NULL,
    NULL,
    NULL,
    {f"'{escape_sql_string(segment_type)}'" if segment_type else 'NULL'},
    'Active',
    {f"'{escape_sql_string(commentary)}'" if commentary else 'NULL'}
);"""

    sql_statements.append(sql)

# Write the SQL file
output_file = '/Users/johnjimenez/Library/CloudStorage/Dropbox/Noble Investment Group/Noble Projects/Noble Extranet/supabase/migrations/017_import_hotel_top_accounts_data.sql'

with open(output_file, 'w') as f:
    f.write('-- Import hotel top accounts data from Excel\n\n')
    for sql in sql_statements:
        f.write(sql + '\n\n')

print(f'Generated SQL migration file: {output_file}')
print(f'Total records: {len(sql_statements)}')
print(f'Top accounts: {len(df[df["account_type"] == "Top"])}')
print(f'Target accounts: {len(df[df["account_type"] == "Target"])}')
