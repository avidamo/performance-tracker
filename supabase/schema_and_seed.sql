begin;

create type public.app_role as enum ('admin', 'employee');
create type public.employee_status as enum ('active', 'placeholder', 'archived');
create type public.goal_status as enum ('not_started', 'in_progress', 'at_risk', 'completed');
create type public.soft_skill_status as enum ('focus', 'improving', 'strong');
create type public.update_type as enum ('reflection', 'manager_checkin', 'self_update');
create type public.manager_note_type as enum ('risk', 'promotion', 'compensation', 'private_note');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_title text not null,
  department text not null default 'Performance',
  status public.employee_status not null default 'active',
  performance_classification text,
  manager_name text,
  review_notes_public text,
  current_quarter_focus text,
  last_review_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.app_role not null,
  employee_id uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  title text not null,
  description text,
  success_signal text,
  category text,
  status public.goal_status not null default 'not_started',
  sort_order integer not null default 0,
  start_date date,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goal_tasks (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  title text not null,
  description text,
  is_completed boolean not null default false,
  completed_at timestamptz,
  due_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.soft_skills (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  skill_name text not null,
  description text,
  current_focus text,
  status public.soft_skill_status not null default 'focus',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_updates (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  month_key text not null,
  update_type public.update_type not null,
  content text not null,
  created_by_user_id uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  title text not null,
  description text,
  achieved_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_summaries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  month_key text not null,
  summary_text text not null,
  accomplishments_text text,
  next_focus_text text,
  generated_by_user_id uuid references public.app_users(id) on delete set null,
  generated_at timestamptz not null default now(),
  source_snapshot_json jsonb not null default '{}'::jsonb,
  constraint monthly_summaries_employee_month_unique unique (employee_id, month_key)
);

create table if not exists public.manager_notes (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  note_type public.manager_note_type not null,
  content text not null,
  created_by_user_id uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.employee_prompt_templates (
  id uuid primary key default gen_random_uuid(),
  role_scope text not null default 'global',
  prompt_text text not null,
  prompt_type text not null,
  sort_order integer not null default 0
);

create index if not exists idx_app_users_employee_id on public.app_users(employee_id);
create index if not exists idx_goals_employee_id on public.goals(employee_id);
create index if not exists idx_goal_tasks_goal_id on public.goal_tasks(goal_id);
create index if not exists idx_soft_skills_employee_id on public.soft_skills(employee_id);
create index if not exists idx_progress_updates_employee_id on public.progress_updates(employee_id);
create index if not exists idx_achievements_employee_id on public.achievements(employee_id);
create index if not exists idx_monthly_summaries_employee_id on public.monthly_summaries(employee_id);
create index if not exists idx_manager_notes_employee_id on public.manager_notes(employee_id);

drop trigger if exists trg_employees_updated_at on public.employees;
create trigger trg_employees_updated_at before update on public.employees for each row execute function public.set_updated_at();
drop trigger if exists trg_goals_updated_at on public.goals;
create trigger trg_goals_updated_at before update on public.goals for each row execute function public.set_updated_at();
drop trigger if exists trg_goal_tasks_updated_at on public.goal_tasks;
create trigger trg_goal_tasks_updated_at before update on public.goal_tasks for each row execute function public.set_updated_at();
drop trigger if exists trg_soft_skills_updated_at on public.soft_skills;
create trigger trg_soft_skills_updated_at before update on public.soft_skills for each row execute function public.set_updated_at();

alter table public.employees enable row level security;
alter table public.app_users enable row level security;
alter table public.goals enable row level security;
alter table public.goal_tasks enable row level security;
alter table public.soft_skills enable row level security;
alter table public.progress_updates enable row level security;
alter table public.achievements enable row level security;
alter table public.monthly_summaries enable row level security;
alter table public.manager_notes enable row level security;
alter table public.employee_prompt_templates enable row level security;

create or replace function public.current_app_role()
returns public.app_role language sql stable as $$
  select role from public.app_users where id = auth.uid()
$$;

create or replace function public.current_employee_id()
returns uuid language sql stable as $$
  select employee_id from public.app_users where id = auth.uid()
$$;

create policy employees_admin_all on public.employees for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy app_users_admin_all on public.app_users for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy goals_admin_all on public.goals for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy goal_tasks_admin_all on public.goal_tasks for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy soft_skills_admin_all on public.soft_skills for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy progress_updates_admin_all on public.progress_updates for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy achievements_admin_all on public.achievements for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy monthly_summaries_admin_all on public.monthly_summaries for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy manager_notes_admin_all on public.manager_notes for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy prompt_templates_admin_all on public.employee_prompt_templates for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

create policy employees_employee_read_own on public.employees for select using (id = public.current_employee_id());
create policy app_users_employee_read_own on public.app_users for select using (id = auth.uid());
create policy goals_employee_read_own on public.goals for select using (employee_id = public.current_employee_id());
create policy goal_tasks_employee_read_own on public.goal_tasks for select using (exists (select 1 from public.goals g where g.id = goal_tasks.goal_id and g.employee_id = public.current_employee_id()));
create policy goal_tasks_employee_update_own on public.goal_tasks for update using (exists (select 1 from public.goals g where g.id = goal_tasks.goal_id and g.employee_id = public.current_employee_id())) with check (exists (select 1 from public.goals g where g.id = goal_tasks.goal_id and g.employee_id = public.current_employee_id()));
create policy soft_skills_employee_read_own on public.soft_skills for select using (employee_id = public.current_employee_id());
create policy progress_updates_employee_read_own on public.progress_updates for select using (employee_id = public.current_employee_id());
create policy progress_updates_employee_insert_own on public.progress_updates for insert with check (employee_id = public.current_employee_id() and created_by_user_id = auth.uid());
create policy achievements_employee_read_own on public.achievements for select using (employee_id = public.current_employee_id());
create policy achievements_employee_insert_own on public.achievements for insert with check (employee_id = public.current_employee_id());
create policy monthly_summaries_employee_read_own on public.monthly_summaries for select using (employee_id = public.current_employee_id());
create policy prompt_templates_employee_read_all on public.employee_prompt_templates for select using (true);

insert into public.employee_prompt_templates (role_scope, prompt_text, prompt_type, sort_order) values
('global','What progress did you make this month?','monthly_reflection',1),
('global','What blockers or challenges came up?','monthly_reflection',2),
('global','What achievement are you most proud of?','monthly_reflection',3),
('global','What should your main focus be next month?','monthly_reflection',4),
('CAM','Which coaches grew meaningfully this month?','monthly_reflection',5),
('CAM','Which coaches are at risk and why?','monthly_reflection',6),
('CGS','Which coaches became more responsive or engaged?','monthly_reflection',7),
('CAM Team Lead','What systems or team improvements did you implement this month?','monthly_reflection',8)
on conflict do nothing;

with seeded as (
  insert into public.employees (name, role_title, department, status, performance_classification, manager_name, review_notes_public, current_quarter_focus, last_review_date)
  values
  ('Jordan Stamman','Senior CAM','Performance','active','Exceeds Expectations','Savannah Sherard','Strong initiative, coach trust, and ownership. Primary focus is proactive visibility and leadership-ready communication.','Improve proactive visibility and leadership alignment while continuing revenue and portfolio growth.','2026-03-01'),
  ('Eugene Moore','Senior CAM','Performance','active','Meets Expectations','Savannah Sherard','Strong systems and data orientation with clear leadership potential. Focus areas are outreach, structure, and earlier escalation.','Build CAM systems and outreach engines while improving structured coaching cadence and proactive escalation.','2026-03-01'),
  ('Elissa Leise','CAM','Performance','active','Meets Expectations','Savannah Sherard','Strong relationship manager with upward momentum. Focus on deeper analytics, strategic authority, and boundaries.','Implement a structured data-to-strategy system and strengthen authority through stronger analytical confidence.','2026-03-01'),
  ('Peri Lindh','CAM','Performance','active','Meets Expectations','Savannah Sherard','Very close to exceeds expectations. Focus on visibility, boundaries, outreach rhythm, and sharing strategic depth.','Increase visibility and create a repeatable weekly strategy-sharing habit while protecting boundaries.','2026-03-01'),
  ('Stephanie O''Rourke','CGS','Performance','active','Exceeds Expectations','Mo Maciejewski','Strong early performance, trust building, and workshop leadership. Main focus is decision autonomy and systems navigation.','Increase decision independence, build stronger internal knowledge systems, and automate repetitive coach workflows.','2026-03-01'),
  ('Mo Maciejewski','CAM Team Lead','Performance','active','Exceeds Expectations','Savannah Sherard','High-trust systems builder and team lead. Main growth areas are delegation, executive framing, and protecting deep work.','Strengthen executive presence, increase delegation, and protect deep work while scaling team ownership.','2026-03-01'),
  ('Begai','CAM','Performance','active','Meets Expectations','Savannah Sherard','High-upside CAM with strong coach acquisition, creativity, and relationship-building. Main focus is consistency, structure, early signaling, and using time with the highest-return coaches.','Build a calendar structure that reflects priorities, protects work blocks, and supports consistent peak performance.','2026-03-01')
  returning id, name
)
select * from seeded;

with emp as (select id, name from public.employees)
insert into public.goals (employee_id, title, description, success_signal, category, status, sort_order, start_date, target_date)
values
((select id from emp where name='Jordan Stamman'),'Leadership visibility','Create stronger leadership-ready updates and write-ups.','Leadership can understand the issue, recommendation, and business impact from the write-up alone.','communication','in_progress',1,'2026-03-01','2026-06-30'),
((select id from emp where name='Jordan Stamman'),'Proactive communication','Raise blockers and frustrations earlier with management.','Fewer late escalations and smoother cross-functional collaboration.','leadership','in_progress',2,'2026-03-01','2026-06-30'),
((select id from emp where name='Jordan Stamman'),'Revenue and portfolio growth','Increase high-value coach acquisition and diversify portfolio growth.','Improved monthly target attainment and stronger portfolio diversification.','revenue','in_progress',3,'2026-03-01','2026-09-30'),
((select id from emp where name='Eugene Moore'),'Build CAM analytics platform','Expand usable CAM dashboards and reporting.','CAM team actively uses the dashboards and can act on the data.','systems','in_progress',1,'2026-03-01','2026-06-30'),
((select id from emp where name='Eugene Moore'),'Build outreach engine','Develop a data-driven outreach process for high-value coaches.','Increase in high-value coach acquisition and better prospect targeting.','outreach','in_progress',2,'2026-03-01','2026-06-30'),
((select id from emp where name='Eugene Moore'),'Predictive coach risk management','Escalate likely churn risks earlier and involve leadership sooner.','Reduced avoidable churn and earlier intervention.','leadership','in_progress',3,'2026-03-01','2026-06-30'),
((select id from emp where name='Elissa Leise'),'Data interpretation depth','Build deeper understanding of metrics and why performance moves.','More confident data-backed recommendations in coach calls.','analytics','in_progress',1,'2026-03-01','2026-06-30'),
((select id from emp where name='Elissa Leise'),'Monthly data-to-strategy system','Create a repeatable review system that improves revenue predictability.','More reliable portfolio forecasting and better month planning.','revenue','in_progress',2,'2026-03-01','2026-06-30'),
((select id from emp where name='Elissa Leise'),'Authority and energy management','Pair empathy with stronger authority and better emotional boundaries.','More strategic coach conversations with less emotional drain.','soft_skill','in_progress',3,'2026-03-01','2026-06-30'),
((select id from emp where name='Peri Lindh'),'Weekly visibility habit','Share wins, insights, and coach learnings regularly with leadership/team.','Consistent internal visibility into coach strategy and wins.','communication','in_progress',1,'2026-03-01','2026-06-30'),
((select id from emp where name='Peri Lindh'),'Boundaries and prioritization','Create and respect stronger work boundaries.','Improved energy and reduced burnout risk.','soft_skill','in_progress',2,'2026-03-01','2026-06-30'),
((select id from emp where name='Peri Lindh'),'Outreach rhythm','Build a consistent outreach habit for new high-value coaches.','Steady pipeline of qualified new coaches.','outreach','in_progress',3,'2026-03-01','2026-09-30'),
((select id from emp where name='Stephanie O''Rourke'),'Decision autonomy','Make more coach-management decisions without unnecessary validation.','Faster execution with confident independent decisions.','leadership','in_progress',1,'2026-03-01','2026-05-31'),
((select id from emp where name='Stephanie O''Rourke'),'Knowledge system','Create a personal system for locating and reusing key information.','Less time lost searching and fewer repeated questions.','systems','in_progress',2,'2026-03-01','2026-05-31'),
((select id from emp where name='Stephanie O''Rourke'),'Automate repetitive workflows','Reduce manual repetition in follow-ups, workshops, and coach nudges.','More scalable portfolio support with less manual work.','systems','in_progress',3,'2026-03-01','2026-06-30'),
((select id from emp where name='Mo Maciejewski'),'Executive communication','Lead with strong framing and be ready for likely follow-up questions.','Leadership increasingly looks to Mo directly for answers.','leadership','in_progress',1,'2026-03-01','2026-06-30'),
((select id from emp where name='Mo Maciejewski'),'Delegation and team ownership','Shift from doing to coaching and letting the team own more of the work.','Team members solve more problems independently and grow faster.','management','in_progress',2,'2026-03-01','2026-06-30'),
((select id from emp where name='Mo Maciejewski'),'Protected deep work and boundaries','Create firmer block time and prioritize highest-leverage work.','Reduced reactivity, less burnout risk, stronger strategic output.','management','in_progress',3,'2026-03-01','2026-06-30'),
((select id from emp where name='Begai'),'Calendar structure and consistency','Build a repeatable work structure that supports consistent peak performance even while traveling.','Peak months become the norm and energy is managed proactively.','performance','in_progress',1,'2026-03-01','2026-06-30'),
((select id from emp where name='Begai'),'High-ROI coach investment','Spend more time on coaches who invest back and redesign low-value meetings.','Higher leverage use of time and stronger portfolio outcomes.','portfolio','in_progress',2,'2026-03-01','2026-06-30'),
((select id from emp where name='Begai'),'Data-backed strategy and initiative ownership','Support ideas with stronger data and own one initiative from concept through completion.','More strategic credibility and visible team impact.','leadership','in_progress',3,'2026-03-01','2026-06-30');

with g as (
  select goals.id, employees.name as employee_name, goals.title
  from public.goals join public.employees on employees.id = goals.employee_id
)
insert into public.goal_tasks (goal_id, title, due_date, sort_order)
values
((select id from g where employee_name='Jordan Stamman' and title='Leadership visibility'),'Draft stronger 30/60/90 and WBR updates','2026-04-15',1),
((select id from g where employee_name='Jordan Stamman' and title='Leadership visibility'),'Get Mo review on major write-ups','2026-04-30',2),
((select id from g where employee_name='Jordan Stamman' and title='Proactive communication'),'Escalate blockers earlier','2026-04-15',1),
((select id from g where employee_name='Jordan Stamman' and title='Revenue and portfolio growth'),'Increase outreach to high-value prospects','2026-05-01',1),
((select id from g where employee_name='Eugene Moore' and title='Build CAM analytics platform'),'Expand Metabase dashboards','2026-04-15',1),
((select id from g where employee_name='Eugene Moore' and title='Build outreach engine'),'Prototype data-driven lead targeting','2026-05-01',1),
((select id from g where employee_name='Eugene Moore' and title='Predictive coach risk management'),'Create early-risk escalation routine','2026-04-15',1),
((select id from g where employee_name='Elissa Leise' and title='Data interpretation depth'),'Join weekly data review sessions','2026-04-01',1),
((select id from g where employee_name='Elissa Leise' and title='Monthly data-to-strategy system'),'Document monthly review workflow','2026-04-10',1),
((select id from g where employee_name='Elissa Leise' and title='Authority and energy management'),'Escalate draining coach situations earlier','2026-04-20',1),
((select id from g where employee_name='Peri Lindh' and title='Weekly visibility habit'),'Post one weekly strategy/wins update','2026-03-14',1),
((select id from g where employee_name='Peri Lindh' and title='Boundaries and prioritization'),'Set daily work stop time and track adherence','2026-03-20',1),
((select id from g where employee_name='Peri Lindh' and title='Outreach rhythm'),'Create one recurring weekly outreach block','2026-03-21',1),
((select id from g where employee_name='Stephanie O''Rourke' and title='Decision autonomy'),'Use search/stakeholder path before asking for validation','2026-03-25',1),
((select id from g where employee_name='Stephanie O''Rourke' and title='Knowledge system'),'Build personal Notion page for key links and workflows','2026-03-20',1),
((select id from g where employee_name='Stephanie O''Rourke' and title='Automate repetitive workflows'),'Prototype workshop and inactivity automations','2026-04-30',1),
((select id from g where employee_name='Mo Maciejewski' and title='Executive communication'),'Prepare opening frames and likely Q&A before management calls','2026-03-18',1),
((select id from g where employee_name='Mo Maciejewski' and title='Delegation and team ownership'),'Re-delegate at least three tasks each week','2026-03-21',1),
((select id from g where employee_name='Mo Maciejewski' and title='Protected deep work and boundaries'),'Protect block time and reduce instant-response behavior','2026-03-21',1),
((select id from g where employee_name='Begai' and title='Calendar structure and consistency'),'Block deep work and meeting windows around real priorities','2026-03-21',1),
((select id from g where employee_name='Begai' and title='Calendar structure and consistency'),'Protect non-negotiable routines while traveling','2026-03-28',2),
((select id from g where employee_name='Begai' and title='High-ROI coach investment'),'Audit meeting cadence and redesign low-value meetings','2026-03-28',1),
((select id from g where employee_name='Begai' and title='High-ROI coach investment'),'Group selected coaches into workshop-style calls where useful','2026-04-15',2),
((select id from g where employee_name='Begai' and title='Data-backed strategy and initiative ownership'),'Increase use of data in coach recommendations','2026-04-15',1),
((select id from g where employee_name='Begai' and title='Data-backed strategy and initiative ownership'),'Own one CAM or coach-marketing initiative end-to-end','2026-05-15',2);

with emp as (select id, name from public.employees)
insert into public.soft_skills (employee_id, skill_name, description, current_focus, status, sort_order)
values
((select id from emp where name='Jordan Stamman'),'Executive communication','Communicate leadership-ready updates with stronger framing.','Make written updates stand on their own.','focus',1),
((select id from emp where name='Jordan Stamman'),'Cross-functional collaboration','Keep passion while staying solution-oriented.','Raise issues earlier and keep a team-first posture.','improving',2),
((select id from emp where name='Eugene Moore'),'Executive communication','Bring a more structured tone into management settings.','Keep personality while increasing structure and authority.','focus',1),
((select id from emp where name='Eugene Moore'),'Team enablement','Share systems and insights that help CAMs work better.','Turn individual wins into repeatable team practices.','improving',2),
((select id from emp where name='Elissa Leise'),'Strategic leadership','Pair empathy with stronger business authority.','Use data confidence to drive more strategic calls.','focus',1),
((select id from emp where name='Elissa Leise'),'Emotional regulation','Protect energy when dealing with hard coach situations.','Escalate draining cases earlier.','focus',2),
((select id from emp where name='Peri Lindh'),'Visibility','Share strategy, wins, and lessons more openly.','Roll the sleeves up and let others see the work.','focus',1),
((select id from emp where name='Peri Lindh'),'Confidence','Reduce imposter syndrome and increase comfortable self-advocacy.','Speak up more in team and leadership settings.','improving',2),
((select id from emp where name='Stephanie O''Rourke'),'Decision confidence','Trust judgment and reduce unnecessary validation loops.','Make more coach decisions independently.','focus',1),
((select id from emp where name='Stephanie O''Rourke'),'Systems thinking','Turn repeated issues into clear process or automation.','Create scalable support patterns.','improving',2),
((select id from emp where name='Mo Maciejewski'),'Executive presence','Strengthen framing and answer with more executive precision.','Make first sentence stronger and more direct.','focus',1),
((select id from emp where name='Mo Maciejewski'),'Delegation','Coach more and do less yourself.','Increase team ownership and reduce bottlenecks.','focus',2),
((select id from emp where name='Begai'),'Consistency','Turn peak performance into a steady baseline.','Use structure and routine to stabilize performance.','focus',1),
((select id from emp where name='Begai'),'Professional communication','Pause, frame, and communicate with more strategic clarity.','Take a beat before speaking and sharpen first-sentence impact.','improving',2),
((select id from emp where name='Begai'),'Early signaling','Raise energy, workload, or motivation concerns sooner.','Use weekly check-ins to flag issues before they escalate.','focus',3);

insert into public.progress_updates (employee_id, month_key, update_type, content, created_by_user_id)
select id, '2026-03', 'self_update', 'Initial seeded profile created. Waiting for first employee-submitted monthly update.', null
from public.employees;

commit;
