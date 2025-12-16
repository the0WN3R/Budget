-- Add foreign key constraint from user_profiles.budget_id to budgets.id
-- This migration runs after the budgets table is created

ALTER TABLE public.user_profiles 
  ADD CONSTRAINT user_profiles_budget_id_fkey 
  FOREIGN KEY (budget_id) REFERENCES public.budgets(id) ON DELETE SET NULL;

