-- Create expenses table
-- This table stores expenses logged against budget tabs/categories

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE NOT NULL,
  tab_id UUID REFERENCES public.budget_tabs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on budget_id for faster lookups
CREATE INDEX IF NOT EXISTS expenses_budget_id_idx ON public.expenses(budget_id);

-- Create index on tab_id for faster lookups
CREATE INDEX IF NOT EXISTS expenses_tab_id_idx ON public.expenses(tab_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON public.expenses(user_id);

-- Create index on expense_date for filtering by date
CREATE INDEX IF NOT EXISTS expenses_expense_date_idx ON public.expenses(expense_date);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own expenses
CREATE POLICY "Users can view own expenses"
  ON public.expenses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own expenses
CREATE POLICY "Users can insert own expenses"
  ON public.expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own expenses
CREATE POLICY "Users can update own expenses"
  ON public.expenses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own expenses
CREATE POLICY "Users can delete own expenses"
  ON public.expenses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_expense_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on expense updates
DROP TRIGGER IF EXISTS set_expense_updated_at ON public.expenses;
CREATE TRIGGER set_expense_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_expense_updated_at();

