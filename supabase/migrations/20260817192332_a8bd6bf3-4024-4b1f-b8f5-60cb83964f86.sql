-- Revoke public execution of has_role to prevent unprivileged calls
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM public;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;

-- Grant to service_role and authenticated (since policies use it) 
-- But restrict its definition to avoid being called directly by users if possible
-- Actually, RLS needs the function to be executable by the roles that use it.
-- The warning is because it's SECURITY DEFINER. 

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;