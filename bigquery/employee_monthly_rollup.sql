-- Create a standardized employee monthly rollup view for the performance tracker.
-- Replace the source tables and field names below with your real BigQuery schema.
-- The app expects employee_name to match the employees.name value in Supabase.

CREATE OR REPLACE VIEW `YOUR_PROJECT.YOUR_DATASET.employee_monthly_rollup` AS
SELECT
  FORMAT_DATE('%Y-%m', month_date) AS month_key,
  cam_name AS employee_name,
  SUM(monthly_revenue) AS revenue_actual,
  SUM(monthly_target) AS revenue_target,
  SUM(portfolio_value) AS portfolio_value,
  COUNT(DISTINCT coach_id) AS active_coaches,
  COUNT(DISTINCT IF(is_responsive, coach_id, NULL)) AS responsive_coaches,
  COUNT(DISTINCT IF(is_new_sign, coach_id, NULL)) AS new_coaches_signed,
  COUNT(DISTINCT IF(campaign_name IS NOT NULL, coach_id, NULL)) AS campaigns_run,
  SUM(campaign_revenue) AS campaign_revenue,
  SAFE_MULTIPLY(SAFE_DIVIDE(SUM(monthly_revenue), NULLIF(SUM(monthly_target), 0)), 100) AS revenue_attainment_pct,
  SAFE_MULTIPLY(
    SAFE_DIVIDE(
      SUM(monthly_revenue) - LAG(SUM(monthly_revenue)) OVER (PARTITION BY cam_name ORDER BY FORMAT_DATE('%Y-%m', month_date)),
      NULLIF(LAG(SUM(monthly_revenue)) OVER (PARTITION BY cam_name ORDER BY FORMAT_DATE('%Y-%m', month_date)), 0)
    ),
    100
  ) AS trend_vs_prior_month_pct,
  ARRAY_AGG(STRUCT(coach_name, monthly_revenue) ORDER BY monthly_revenue DESC LIMIT 1)[OFFSET(0)].coach_name AS top_coach_name,
  ARRAY_AGG(STRUCT(coach_name, monthly_revenue) ORDER BY monthly_revenue DESC LIMIT 1)[OFFSET(0)].monthly_revenue AS top_coach_revenue
FROM `YOUR_PROJECT.YOUR_SOURCE_DATASET.coach_monthly_facts`
GROUP BY month_key, employee_name;
