create role anon noinherit;
create role authenticated noinherit;

grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;

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

alter table public.pois enable row level security;

create policy "pois readable by anyone"
  on public.pois for select
  using (true);

grant select on public.pois to anon, authenticated;

insert into public.pois (name, category, latitude, longitude, description, tags) values
  ('School of Engineering and Engineering Technology', 'Department', 5.3915, 7.0025, 'SEET administrative building', '{SEET,engineering}'),
  ('School of Science and Technology', 'Department', 5.3930, 7.0010, 'SST main building', '{SST,science}'),
  ('School of Agriculture and Agricultural Technology', 'Department', 5.3945, 7.0035, 'SAAT building', '{SAAT,agriculture}'),
  ('School of Management Technology', 'Department', 5.3905, 7.0005, 'SMAT building', '{SMAT,management}'),
  ('School of Health Technology', 'Department', 5.3920, 7.0040, 'SHT building', '{SHT,health}'),
  ('School of Postgraduate Studies', 'Admin', 5.3950, 7.0020, 'SPGS building', '{SPGS,postgraduate}'),
  ('University Library', 'Library', 5.3935, 7.0015, 'Main library', '{library,books}'),
  ('Student Affairs Building', 'Admin', 5.3910, 7.0030, 'Dean of Students office', '{student,affairs}'),
  ('Senate Building', 'Admin', 5.3925, 7.0020, 'University Senate and VC office', '{school,administration}'),
  ('Medical Centre', 'Medical', 5.3940, 7.0045, 'Campus health services', '{hospital,clinic,health}');
