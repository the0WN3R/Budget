-- Create support_requests table
-- This table stores support requests from users

CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS support_requests_user_id_idx ON public.support_requests(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS support_requests_status_idx ON public.support_requests(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS support_requests_created_at_idx ON public.support_requests(created_at);

-- Enable Row Level Security
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert support requests (even anonymous users)
CREATE POLICY "Anyone can create support requests"
  ON public.support_requests
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own support requests
CREATE POLICY "Users can view own support requests"
  ON public.support_requests
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    user_id IS NULL
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_support_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on support request updates
DROP TRIGGER IF EXISTS set_support_request_updated_at ON public.support_requests;
CREATE TRIGGER set_support_request_updated_at
  BEFORE UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_support_request_updated_at();

