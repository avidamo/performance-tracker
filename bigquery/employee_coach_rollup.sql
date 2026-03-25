-- Create a standardized employee coach rollup view for the performance tracker.
-- Replace the source tables and field names below with your real BigQuery schema.
-- The app expects employee_name to match the employees.name value in Supabase.

CREATE OR REPLACE VIEW `YOUR_PROJECT.YOUR_DATASET.employee_coach_rollup` AS
SELECT
  FORMAT_DATE('%Y-%m', month_date) AS month_key,
  cam_name AS employee_name,
  coach_name,
  monthly_revenue AS revenue_actual,
  monthly_target AS revenue_target,
  campaign_name,
  campaign_revenue,
  is_responsive AS responsive,
  coach_status AS status_label
FROM `YOUR_PROJECT.YOUR_SOURCE_DATASET.coach_monthly_facts`;
