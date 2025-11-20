#!/usr/bin/env python3
"""
Script to generate SQL migration for importing initiatives data from Excel
"""
import pandas as pd

# Read the Excel file
excel_file = '/Users/johnjimenez/Library/CloudStorage/Dropbox/Noble Investment Group/Noble Projects/2026 Budget/MicKibbon/2026_initiatives.xlsx'
df = pd.read_excel(excel_file, sheet_name='Initiatives')

# Clean column names
df.columns = ['hotel', 'initiative_type', 'initiative']

def escape_sql_string(s):
    """Escape single quotes in SQL strings"""
    if s is None or pd.isna(s):
        return None
    return str(s).replace("'", "''")

# Generate SQL statements
sql_statements = []

for _, row in df.iterrows():
    hotel = escape_sql_string(row['hotel'])
    initiative_type = escape_sql_string(row['initiative_type'])
    initiative = escape_sql_string(row['initiative'])

    sql = f"""INSERT INTO public.initiatives (hotel_name, initiative_type, initiative_text, status) VALUES (
    '{hotel}',
    '{initiative_type}',
    '{initiative}',
    'Active'
);"""

    sql_statements.append(sql)

# Write the SQL file
output_file = '/Users/johnjimenez/Library/CloudStorage/Dropbox/Noble Investment Group/Noble Projects/Noble Extranet/supabase/migrations/019_import_initiatives_data.sql'

with open(output_file, 'w') as f:
    f.write('-- Import initiatives data from Excel\n\n')
    for sql in sql_statements:
        f.write(sql + '\n\n')

print(f'Generated SQL migration file: {output_file}')
print(f'Total records: {len(sql_statements)}')
print(f'Expense initiatives: {len(df[df["initiative_type"] == "Expense"])}')
print(f'Revenue initiatives: {len(df[df["initiative_type"] == "Revenue"])}')
