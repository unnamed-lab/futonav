alter table public.pois enable row level security;

create policy "pois readable by anyone"
  on public.pois for select
  using (true);

create policy "pois writable by admins"
  on public.pois for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');
