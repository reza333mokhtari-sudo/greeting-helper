create table public.admin_audit_logs (
    id uuid primary key default gen_random_uuid(),
    admin_id uuid not null references auth.users(id) on delete cascade,
    action text not null,
    table_name text not null,
    row_id text,
    payload jsonb,
    created_at timestamptz default now()
);

grant select on public.admin_audit_logs to authenticated;
grant all on public.admin_audit_logs to service_role;

alter table public.admin_audit_logs enable row level security;

create policy "Admins can view audit logs" on public.admin_audit_logs for select to authenticated using (public.has_role(auth.uid(), 'admin'));
