ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS assignee_id uuid REFERENCES auth.users(id);