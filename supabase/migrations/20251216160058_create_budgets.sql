-- Create budgets table
-- This table stores budget information for users

CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  currency_code TEXT DEFAULT 'USD' CHECK (currency_code ~ '^[A-Z]{3}$'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON public.budgets(user_id);

-- Create budget_tabs table
-- This table stores tabs/categories within a budget (allows dynamic tabs)
-- Each tab represents a category or section in the budget (e.g., "Food", "Transportation", "Entertainment")

CREATE TABLE IF NOT EXISTS public.budget_tabs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Optional: hex color code for UI display (e.g., "#FF5733")
  icon TEXT, -- Optional: icon identifier for UI
  position INTEGER NOT NULL DEFAULT 0, -- Order/position of the tab
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT budget_tabs_budget_name_unique UNIQUE(budget_id, name) -- Prevent duplicate tab names within a budget
);

-- Create index on budget_id for faster lookups
CREATE INDEX IF NOT EXISTS budget_tabs_budget_id_idx ON public.budget_tabs(budget_id);

-- Create index on position for sorting
CREATE INDEX IF NOT EXISTS budget_tabs_position_idx ON public.budget_tabs(budget_id, position);

-- Enable Row Level Security
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_tabs ENABLE ROW LEVEL SECURITY;

-- Budgets RLS Policies

-- Policy: Users can view their own budgets
CREATE POLICY "Users can view own budgets"
  ON public.budgets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = budgets.user_id
      AND user_profiles.id = auth.uid()
    )
  );

-- Policy: Users can insert their own budgets
CREATE POLICY "Users can insert own budgets"
  ON public.budgets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = budgets.user_id
      AND user_profiles.id = auth.uid()
    )
  );

-- Policy: Users can update their own budgets
CREATE POLICY "Users can update own budgets"
  ON public.budgets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = budgets.user_id
      AND user_profiles.id = auth.uid()
    )
  );

-- Policy: Users can delete their own budgets
CREATE POLICY "Users can delete own budgets"
  ON public.budgets
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = budgets.user_id
      AND user_profiles.id = auth.uid()
    )
  );

-- Budget Tabs RLS Policies

-- Policy: Users can view tabs for their own budgets
CREATE POLICY "Users can view tabs for own budgets"
  ON public.budget_tabs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets
      JOIN public.user_profiles ON budgets.user_id = user_profiles.id
      WHERE budgets.id = budget_tabs.budget_id
      AND user_profiles.id = auth.uid()
    )
  );

-- Policy: Users can insert tabs for their own budgets
CREATE POLICY "Users can insert tabs for own budgets"
  ON public.budget_tabs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.budgets
      JOIN public.user_profiles ON budgets.user_id = user_profiles.id
      WHERE budgets.id = budget_tabs.budget_id
      AND user_profiles.id = auth.uid()
    )
  );

-- Policy: Users can update tabs for their own budgets
CREATE POLICY "Users can update tabs for own budgets"
  ON public.budget_tabs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets
      JOIN public.user_profiles ON budgets.user_id = user_profiles.id
      WHERE budgets.id = budget_tabs.budget_id
      AND user_profiles.id = auth.uid()
    )
  );

-- Policy: Users can delete tabs for their own budgets
CREATE POLICY "Users can delete tabs for own budgets"
  ON public.budget_tabs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets
      JOIN public.user_profiles ON budgets.user_id = user_profiles.id
      WHERE budgets.id = budget_tabs.budget_id
      AND user_profiles.id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp for budgets
CREATE OR REPLACE FUNCTION public.handle_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on budget updates
DROP TRIGGER IF EXISTS set_budgets_updated_at ON public.budgets;
CREATE TRIGGER set_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_budgets_updated_at();

-- Function to automatically update updated_at timestamp for budget_tabs
CREATE OR REPLACE FUNCTION public.handle_budget_tabs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on budget_tabs updates
DROP TRIGGER IF EXISTS set_budget_tabs_updated_at ON public.budget_tabs;
CREATE TRIGGER set_budget_tabs_updated_at
  BEFORE UPDATE ON public.budget_tabs
  FOR EACH ROW EXECUTE FUNCTION public.handle_budget_tabs_updated_at();

-- Add comments
COMMENT ON TABLE public.budgets IS 'Budget information for users. Each user can have multiple budgets.';
COMMENT ON COLUMN public.budgets.user_id IS 'Foreign key reference to user_profiles. Links budget to user.';
COMMENT ON COLUMN public.budgets.name IS 'Name of the budget (e.g., "Monthly Budget 2024", "Vacation Fund")';
COMMENT ON COLUMN public.budgets.currency_code IS 'ISO 4217 currency code for this budget (e.g., USD, EUR, GBP)';

COMMENT ON TABLE public.budget_tabs IS 'Tabs/categories within a budget. Allows users to organize expenses by category (e.g., Food, Transportation, Entertainment).';
COMMENT ON COLUMN public.budget_tabs.budget_id IS 'Foreign key reference to budgets. Links tab to parent budget.';
COMMENT ON COLUMN public.budget_tabs.name IS 'Name of the tab/category';
COMMENT ON COLUMN public.budget_tabs.position IS 'Order/position of the tab within the budget. Lower numbers appear first.';

