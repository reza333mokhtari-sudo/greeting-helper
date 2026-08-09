-- Revoke default execute from all roles to prevent unauthorized execution
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

-- Grant execute to service_role (which handles the trigger)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
