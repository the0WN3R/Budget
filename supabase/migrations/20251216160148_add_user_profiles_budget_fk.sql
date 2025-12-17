-- Add foreign key constraint from user_profiles.budget_id to budgets.id
-- This migration runs after the budgets table is created

-- First, ensure the budget_id column exists (in case it wasn't created in the initial migration)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'budget_id'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN budget_id UUID;
  END IF;
END $$;

-- Now add the foreign key constraint (only if it doesn't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
    AND constraint_name = 'user_profiles_budget_id_fkey'
  ) THEN
    ALTER TABLE public.user_profiles 
      ADD CONSTRAINT user_profiles_budget_id_fkey 
      FOREIGN KEY (budget_id) REFERENCES public.budgets(id) ON DELETE SET NULL;
  END IF;
END $$;

