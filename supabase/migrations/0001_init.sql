create type poi_category as enum (
  'Department', 'Hostel', 'Admin', 'Cafeteria',
  'Gate', 'Sports', 'Medical', 'Library', 'Other'
);

create table public.pois (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    poi_category not null,
  latitude    double precision not null,
  longitude   double precision not null,
  description text check (char_length(description) <= 200),
  tags        text[] not null default '{}',
  image_url   text,
  updated_at  timestamptz not null default now()
);

create index pois_updated_at_idx on public.pois (updated_at);
create index pois_tags_gin on public.pois using gin (tags);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger pois_set_updated_at before update on public.pois
  for each row execute function set_updated_at();
