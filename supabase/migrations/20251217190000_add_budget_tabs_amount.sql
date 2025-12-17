-- Add amount_allocated column to budget_tabs
-- This stores how much money is allocated to each tab/category

ALTER TABLE public.budget_tabs 
ADD COLUMN IF NOT EXISTS amount_allocated DECIMAL(10, 2) DEFAULT 0.00 CHECK (amount_allocated >= 0);

-- Add comment
COMMENT ON COLUMN public.budget_tabs.amount_allocated IS 'Amount of money allocated to this tab/category. Must be >= 0.';

