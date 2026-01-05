#!/usr/bin/env python3
"""
Extract hotel images from Excel file and save them to the images/hotels directory.
Maps sheet names to image files using the xlsx relationship files.
Gets the LARGEST image from each sheet (the hotel photo, not the logo).
"""

import os
import sys
import zipfile
import re
import xml.etree.ElementTree as ET

# Paths
EXCEL_FILE = "/Users/johnjimenez/Library/CloudStorage/Dropbox/_Claude/Projects/Noble Extranet/Hotel Fact Sheet/All Hotel Fact Sheets 5.2025.xlsx"
OUTPUT_DIR = "/Users/johnjimenez/Library/CloudStorage/Dropbox/_Claude/Projects/Noble Extranet/images/hotels"

def sanitize_filename(name):
    """Convert sheet name to a safe filename."""
    # Replace spaces and special characters
    safe_name = re.sub(r'[^\w\-]', '_', name)
    # Remove consecutive underscores
    safe_name = re.sub(r'_+', '_', safe_name)
    # Remove leading/trailing underscores
    safe_name = safe_name.strip('_')
    return safe_name.lower()

def extract_images_from_xlsx(xlsx_path, output_dir):
    """Extract all images from an Excel file with proper sheet mapping."""

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    print(f"Processing: {xlsx_path}")

    sheet_image_map = {}

    with zipfile.ZipFile(xlsx_path, 'r') as zip_ref:
        all_files = zip_ref.namelist()

        # First, get sizes of all media files
        media_sizes = {}
        for f in all_files:
            if f.startswith('xl/media/'):
                info = zip_ref.getinfo(f)
                media_sizes[f] = info.file_size

        # Parse workbook.xml to get sheet names and their rIds
        workbook_xml = zip_ref.read('xl/workbook.xml').decode('utf-8')
        workbook_root = ET.fromstring(workbook_xml)

        # Get namespaces
        ns = {
            'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
            'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
        }

        # Map sheet names to rIds
        sheet_rid_map = {}
        for sheet in workbook_root.findall('.//main:sheet', ns):
            name = sheet.get('name')
            rid = sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            sheet_rid_map[rid] = name

        # Parse workbook.xml.rels to map rIds to sheet files
        workbook_rels = zip_ref.read('xl/_rels/workbook.xml.rels').decode('utf-8')
        workbook_rels_root = ET.fromstring(workbook_rels)

        rid_to_sheet_file = {}
        for rel in workbook_rels_root.findall('.//{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
            rid = rel.get('Id')
            target = rel.get('Target')
            if target and target.startswith('worksheets/'):
                rid_to_sheet_file[rid] = target

        # Map sheet file numbers to sheet names
        sheet_file_to_name = {}
        for rid, name in sheet_rid_map.items():
            if rid in rid_to_sheet_file:
                sheet_file = rid_to_sheet_file[rid]
                # Extract sheet number from filename like 'worksheets/sheet1.xml'
                match = re.search(r'sheet(\d+)\.xml', sheet_file)
                if match:
                    sheet_num = match.group(1)
                    sheet_file_to_name[sheet_num] = name

        print(f"Found {len(sheet_file_to_name)} sheets")

        # Now go through each sheet and find its drawing, then find the LARGEST image in that drawing
        extracted_count = 0

        for sheet_num, sheet_name in sheet_file_to_name.items():
            # Check if this sheet has a relationship file
            sheet_rels_path = f'xl/worksheets/_rels/sheet{sheet_num}.xml.rels'

            if sheet_rels_path not in all_files:
                continue

            sheet_rels = zip_ref.read(sheet_rels_path).decode('utf-8')
            sheet_rels_root = ET.fromstring(sheet_rels)

            # Find drawing reference in sheet rels
            drawing_path = None
            for rel in sheet_rels_root.findall('.//{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
                rel_type = rel.get('Type')
                if rel_type and 'drawing' in rel_type:
                    target = rel.get('Target')
                    if target:
                        # Resolve relative path
                        drawing_path = 'xl/' + target.replace('../', '')
                        break

            if not drawing_path or drawing_path not in all_files:
                continue

            # Find the drawing's relationship file
            drawing_name = os.path.basename(drawing_path)
            drawing_rels_path = f'xl/drawings/_rels/{drawing_name}.rels'

            if drawing_rels_path not in all_files:
                continue

            drawing_rels = zip_ref.read(drawing_rels_path).decode('utf-8')
            drawing_rels_root = ET.fromstring(drawing_rels)

            # Find ALL image references and pick the LARGEST one (hotel photo, not logo)
            best_image = None
            best_size = 0

            for rel in drawing_rels_root.findall('.//{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
                rel_type = rel.get('Type')
                if rel_type and 'image' in rel_type:
                    target = rel.get('Target')
                    if target:
                        # Resolve relative path
                        image_path = 'xl/' + target.replace('../', '')

                        if image_path in all_files:
                            size = media_sizes.get(image_path, 0)
                            if size > best_size:
                                best_size = size
                                best_image = image_path

            if best_image:
                # Get image data
                img_data = zip_ref.read(best_image)

                # Get extension
                ext = os.path.splitext(best_image)[1].lstrip('.')

                # Create filename from sheet name
                safe_name = sanitize_filename(sheet_name)
                filename = f"{safe_name}.{ext}"

                filepath = os.path.join(output_dir, filename)

                # Save the image
                with open(filepath, 'wb') as f:
                    f.write(img_data)

                extracted_count += 1
                sheet_image_map[sheet_name] = filename
                print(f"  {sheet_name} -> {filename} ({best_size:,} bytes)")

        print(f"\nExtracted {extracted_count} images to {output_dir}")

        # Generate SQL update statements
        print("\n--- SQL Migration File Content ---")
        print("-- Migration: 030_add_hotel_images.sql")
        print("-- Add image_url column and update with extracted hotel images")
        print()
        print("-- Add image_url column if it doesn't exist")
        print("ALTER TABLE public.hotel_fact_sheets ADD COLUMN IF NOT EXISTS image_url TEXT;")
        print()
        print("-- Update image URLs based on excel_sheet_name")

        for sheet_name, filename in sorted(sheet_image_map.items()):
            # Escape single quotes in sheet name
            escaped_name = sheet_name.replace("'", "''")
            print(f"UPDATE public.hotel_fact_sheets SET image_url = 'images/hotels/{filename}' WHERE excel_sheet_name = '{escaped_name}';")

    return sheet_image_map

if __name__ == "__main__":
    if not os.path.exists(EXCEL_FILE):
        print(f"Error: Excel file not found at {EXCEL_FILE}")
        sys.exit(1)

    mapping = extract_images_from_xlsx(EXCEL_FILE, OUTPUT_DIR)
    print(f"\nTotal mappings: {len(mapping)}")
