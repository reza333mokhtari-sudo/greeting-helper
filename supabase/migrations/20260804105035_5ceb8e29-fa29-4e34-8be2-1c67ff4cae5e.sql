-- roles
create type public.app_role as enum ('admin','moderator','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can read their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

create policy "Admins can read all roles"
  on public.user_roles for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- prop library: tags + favorites
alter table public.map_assets
  add column if not exists tags text[] not null default '{}',
  add column if not exists favorite boolean not null default false;

create index if not exists map_assets_tags_idx on public.map_assets using gin (tags);

-- admin oversight
create policy "Admins can manage all maps"
  on public.maps for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create policy "Admins can manage all assets"
  on public.map_assets for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- CMS
create table public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null default '',
  published boolean not null default false,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.cms_pages to anon;
grant select, insert, update, delete on public.cms_pages to authenticated;
grant all on public.cms_pages to service_role;

alter table public.cms_pages enable row level security;

create policy "Published pages are readable by anyone"
  on public.cms_pages for select
  using (published = true);

create policy "Admins can read all pages"
  on public.cms_pages for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

create policy "Admins can manage pages"
  on public.cms_pages for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create trigger cms_pages_touch_updated_at
  before update on public.cms_pages
  for each row execute function public.touch_updated_at();