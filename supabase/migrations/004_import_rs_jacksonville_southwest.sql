-- Import RS Jacksonville Southwest hotel project and tasks
-- This creates the example project from the Tasks.pdf document

-- Insert the hotel project
INSERT INTO hotel_projects (id, name, status, opening_date, created_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'RS Jacksonville Southwest',
    'In Progress',
    '2025-12-01',
    NOW()
);

-- Insert tasks from the critical path
-- Opening - Brand tasks
INSERT INTO project_tasks (project_id, task_name, department, additional_info, target_date, status, responsible, steps_done, tag, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Access - Marriott Standards', 'Opening_brand', NULL, '2025-03-19', 'Complete', NULL, NULL, NULL, 1),
('a0000000-0000-0000-0000-000000000001', 'Begin purchase - Marriott Bonvoy key cards + packets', 'Opening_brand', NULL, '2025-04-16', 'Complete', NULL, NULL, NULL, 2),
('a0000000-0000-0000-0000-000000000001', 'Register - GXP Property Admin', 'Opening_brand', NULL, '2025-10-22', 'Not Started', NULL, NULL, NULL, 3),
('a0000000-0000-0000-0000-000000000001', 'Review - Uniform options', 'Opening_brand', NULL, '2025-09-03', 'Not Started', NULL, NULL, NULL, 4),
('a0000000-0000-0000-0000-000000000001', 'Complete - Franchise Application', 'Opening_brand', NULL, '2025-02-26', 'Complete', NULL, NULL, NULL, 5);

-- Opening - Engineering tasks
INSERT INTO project_tasks (project_id, task_name, department, additional_info, target_date, status, responsible, steps_done, tag, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'ADA Compliance - Site Visit', 'Opening_engineering', NULL, '2025-10-08', 'Not Started', NULL, NULL, NULL, 1),
('a0000000-0000-0000-0000-000000000001', 'Review - Engineering PMs', 'Opening_engineering', NULL, '2025-10-08', 'Not Started', NULL, NULL, NULL, 2),
('a0000000-0000-0000-0000-000000000001', 'Setup - Key card system', 'Opening_engineering', NULL, '2025-11-05', 'Not Started', NULL, NULL, NULL, 3),
('a0000000-0000-0000-0000-000000000001', 'Review - Pool maintenance requirements', 'Opening_engineering', NULL, '2025-10-22', 'Not Started', NULL, NULL, NULL, 4);

-- Opening - Finance tasks
INSERT INTO project_tasks (project_id, task_name, department, additional_info, target_date, status, responsible, steps_done, tag, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Setup - Property in accounting system', 'Opening_finance', NULL, '2025-09-17', 'Not Started', NULL, NULL, NULL, 1),
('a0000000-0000-0000-0000-000000000001', 'Create - Chart of accounts', 'Opening_finance', NULL, '2025-10-01', 'Not Started', NULL, NULL, NULL, 2),
('a0000000-0000-0000-0000-000000000001', 'Setup - Banking accounts', 'Opening_finance', NULL, '2025-10-15', 'Not Started', NULL, NULL, NULL, 3),
('a0000000-0000-0000-0000-000000000001', 'Review - Budget vs Forecast', 'Opening_finance', NULL, '2025-11-12', 'Not Started', NULL, NULL, NULL, 4);

-- Opening - Front Office tasks
INSERT INTO project_tasks (project_id, task_name, department, additional_info, target_date, status, responsible, steps_done, tag, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Activate - Sertifi eAuthorize', 'Opening_front_office', NULL, '2025-11-05', 'In Progress', NULL, NULL, NULL, 1),
('a0000000-0000-0000-0000-000000000001', 'Setup - PMS system', 'Opening_front_office', NULL, '2025-10-29', 'Not Started', NULL, NULL, NULL, 2),
('a0000000-0000-0000-0000-000000000001', 'Train - Front desk staff on PMS', 'Opening_front_office', NULL, '2025-11-19', 'Not Started', NULL, NULL, NULL, 3),
('a0000000-0000-0000-0000-000000000001', 'Create - Room types and rate codes', 'Opening_front_office', NULL, '2025-10-22', 'Not Started', NULL, NULL, NULL, 4),
('a0000000-0000-0000-0000-000000000001', 'Setup - Credit card processing', 'Opening_front_office', NULL, '2025-11-05', 'Not Started', NULL, NULL, NULL, 5);

-- Opening - Human Resources tasks
INSERT INTO project_tasks (project_id, task_name, department, additional_info, target_date, status, responsible, steps_done, tag, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Post - Job openings for key positions', 'Opening_human_resources', NULL, '2025-09-03', 'Not Started', NULL, NULL, NULL, 1),
('a0000000-0000-0000-0000-000000000001', 'Conduct - Management interviews', 'Opening_human_resources', NULL, '2025-09-24', 'Not Started', NULL, NULL, NULL, 2),
('a0000000-0000-0000-0000-000000000001', 'Setup - Payroll system', 'Opening_human_resources', NULL, '2025-10-15', 'Not Started', NULL, NULL, NULL, 3),
('a0000000-0000-0000-0000-000000000001', 'Create - Employee handbook', 'Opening_human_resources', NULL, '2025-10-08', 'Not Started', NULL, NULL, NULL, 4),
('a0000000-0000-0000-0000-000000000001', 'Schedule - New hire orientation', 'Opening_human_resources', NULL, '2025-11-12', 'Not Started', NULL, NULL, NULL, 5);

-- Opening - Management Company tasks
INSERT INTO project_tasks (project_id, task_name, department, additional_info, target_date, status, responsible, steps_done, tag, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Review - Management agreement', 'Opening_management_company', NULL, '2025-08-20', 'Complete', NULL, NULL, NULL, 1),
('a0000000-0000-0000-0000-000000000001', 'Assign - General Manager', 'Opening_management_company', NULL, '2025-09-03', 'Complete', NULL, NULL, NULL, 2),
('a0000000-0000-0000-0000-000000000001', 'Schedule - Pre-opening meetings', 'Opening_management_company', NULL, '2025-10-01', 'Not Started', NULL, NULL, NULL, 3);

-- Opening - Marketing tasks
INSERT INTO project_tasks (project_id, task_name, department, additional_info, target_date, status, responsible, steps_done, tag, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Create - Property website', 'Opening_marketing', NULL, '2025-10-08', 'In Progress', NULL, NULL, NULL, 1),
('a0000000-0000-0000-0000-000000000001', 'Setup - Social media accounts', 'Opening_marketing', NULL, '2025-10-01', 'Not Started', NULL, NULL, NULL, 2),
('a0000000-0000-0000-0000-000000000001', 'Develop - Pre-opening marketing plan', 'Opening_marketing', NULL, '2025-09-17', 'In Progress', NULL, NULL, NULL, 3),
('a0000000-0000-0000-0000-000000000001', 'Order - Property signage', 'Opening_marketing', NULL, '2025-10-15', 'Not Started', NULL, NULL, NULL, 4),
('a0000000-0000-0000-0000-000000000001', 'Plan - Grand opening event', 'Opening_marketing', NULL, '2025-11-12', 'Not Started', NULL, NULL, NULL, 5);

-- Opening - Marketing Products tasks
INSERT INTO project_tasks (project_id, task_name, department, additional_info, target_date, status, responsible, steps_done, tag, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Setup - Google My Business', 'Opening_marketing_products', NULL, '2025-10-08', 'Not Started', NULL, NULL, NULL, 1),
('a0000000-0000-0000-0000-000000000001', 'Configure - Online booking engine', 'Opening_marketing_products', NULL, '2025-10-22', 'Not Started', NULL, NULL, NULL, 2),
('a0000000-0000-0000-0000-000000000001', 'Setup - TripAdvisor listing', 'Opening_marketing_products', NULL, '2025-10-15', 'Not Started', NULL, NULL, NULL, 3);

-- Opening - Revenue Management tasks
INSERT INTO project_tasks (project_id, task_name, department, additional_info, target_date, status, responsible, steps_done, tag, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Conduct - Competitive set analysis', 'Opening_revenue_management', NULL, '2025-09-10', 'Complete', NULL, NULL, NULL, 1),
('a0000000-0000-0000-0000-000000000001', 'Create - Opening rate strategy', 'Opening_revenue_management', NULL, '2025-09-24', 'In Progress', NULL, NULL, NULL, 2),
('a0000000-0000-0000-0000-000000000001', 'Setup - Revenue management system', 'Opening_revenue_management', NULL, '2025-10-15', 'Not Started', NULL, NULL, NULL, 3),
('a0000000-0000-0000-0000-000000000001', 'Load - Rate codes into PMS', 'Opening_revenue_management', NULL, '2025-10-29', 'Not Started', NULL, NULL, NULL, 4);

-- Opening - Sales tasks
INSERT INTO project_tasks (project_id, task_name, department, additional_info, target_date, status, responsible, steps_done, tag, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Develop - Sales and marketing plan', 'Opening_sales', NULL, '2025-09-17', 'In Progress', NULL, NULL, NULL, 1),
('a0000000-0000-0000-0000-000000000001', 'Identify - Key accounts and corporate clients', 'Opening_sales', NULL, '2025-09-24', 'Not Started', NULL, NULL, NULL, 2),
('a0000000-0000-0000-0000-000000000001', 'Schedule - Sales calls with local businesses', 'Opening_sales', NULL, '2025-10-15', 'Not Started', NULL, NULL, NULL, 3),
('a0000000-0000-0000-0000-000000000001', 'Create - Group sales collateral', 'Opening_sales', NULL, '2025-10-22', 'Not Started', NULL, NULL, NULL, 4);

-- Opening - Sales + Pricing Products tasks
INSERT INTO project_tasks (project_id, task_name, department, additional_info, target_date, status, responsible, steps_done, tag, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Setup - GDS connectivity', 'Opening_sales_pricing_products', NULL, '2025-10-22', 'Not Started', NULL, NULL, NULL, 1),
('a0000000-0000-0000-0000-000000000001', 'Configure - Channel manager', 'Opening_sales_pricing_products', NULL, '2025-10-29', 'Not Started', NULL, NULL, NULL, 2);

-- Opening - Sales Advisory Tracking tasks
INSERT INTO project_tasks (project_id, task_name, department, additional_info, target_date, status, responsible, steps_done, tag, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Review - Sales tracking procedures', 'Opening_sales_advisory_tracking', NULL, '2025-10-01', 'Not Started', NULL, NULL, NULL, 1),
('a0000000-0000-0000-0000-000000000001', 'Setup - CRM system', 'Opening_sales_advisory_tracking', NULL, '2025-10-15', 'Not Started', NULL, NULL, NULL, 2);

-- Opening - Total Hotel tasks
INSERT INTO project_tasks (project_id, task_name, department, additional_info, target_date, status, responsible, steps_done, tag, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Complete - Final walk-through', 'Opening_total_hotel', NULL, '2025-11-26', 'Not Started', NULL, NULL, NULL, 1),
('a0000000-0000-0000-0000-000000000001', 'Obtain - Certificate of occupancy', 'Opening_total_hotel', NULL, '2025-11-19', 'Not Started', NULL, NULL, NULL, 2),
('a0000000-0000-0000-0000-000000000001', 'Conduct - Soft opening', 'Opening_total_hotel', NULL, '2025-11-26', 'Not Started', NULL, NULL, NULL, 3),
('a0000000-0000-0000-0000-000000000001', 'Schedule - Grand opening', 'Opening_total_hotel', NULL, '2025-12-01', 'Not Started', NULL, NULL, NULL, 4),
('a0000000-0000-0000-0000-000000000001', 'Complete - Punch list items', 'Opening_total_hotel', NULL, '2025-11-19', 'Not Started', NULL, NULL, NULL, 5);
