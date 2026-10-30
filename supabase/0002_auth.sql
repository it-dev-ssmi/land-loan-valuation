-- ========================================================================
-- 0002_auth.sql — ລະບົບຜູ້ໃຊ້ (login) + ແຍກສິດຕາມແຂວງ
-- ລັນຫຼັງ 0001_init.sql (ແລະ seed). ໃຊ້ Supabase Auth.
-- ========================================================================
-- ແນວຄິດ:
--   profiles         = ຂໍ້ມູນຜູ້ໃຊ້ (ຢູເຊີ, ຊື່, ບົດບາດ admin/staff)
--   user_provinces   = ແຂວງທີ່ staff ແຕ່ລະຄົນມີສິດ (admin ເຫັນທຸກແຂວງ)
--   RLS              = ຖານຂໍ້ມູນບັງຄັບສິດເອງ — ເຖິງວ່າ UI ຈະເປີດ ກໍແກ້ຂ້າມແຂວງບໍ່ໄດ້
-- ========================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  role text not null default 'staff',   -- 'admin' | 'staff'
  created_at timestamptz not null default now()
);

create table if not exists public.user_provinces (
  user_id uuid not null references public.profiles(id) on delete cascade,
  province_id uuid not null references public.provinces(id) on delete cascade,
  primary key (user_id, province_id)
);

-- ---- helper functions (security definer ເພື່ອບໍ່ວົນ RLS) ----
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

create or replace function public.can_access_province(pid uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select public.is_admin()
      or exists(select 1 from public.user_provinces up where up.user_id = auth.uid() and up.province_id = pid);
$$;

-- province_id ຂອງແຕ່ລະບ້ານ (ຜ່ານ village -> district)
create or replace function public.village_province(vid uuid)
returns uuid language sql stable security definer set search_path=public as $$
  select d.province_id from public.villages v join public.districts d on d.id = v.district_id where v.id = vid;
$$;

-- ========================================================================
-- profiles / user_provinces RLS
-- ========================================================================
alter table public.profiles       enable row level security;
alter table public.user_provinces enable row level security;

create policy "profiles self read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "profiles admin write" on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "uprov read" on public.user_provinces for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "uprov admin write" on public.user_provinces for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ========================================================================
-- ແທນທີ່ policy "ເປີດທຸກຄົນ" ຈາກ 0001 ດ້ວຍ policy ແຍກສິດຕາມແຂວງ
-- ========================================================================
-- ລຶບ policy ເກົ່າ (ເປີດໃຫ້ authenticated ທຸກຄົນຂຽນ)
do $$ declare t text; begin
  foreach t in array array['provinces','districts','villages','road_types',
      'land_prices','building_types','building_conditions','settings']
  loop execute format('drop policy if exists "admin write %1$s" on public.%1$I;', t); end loop;
end $$;

-- ຂໍ້ມູນທົ່ວໄປ (ບໍ່ຂຶ້ນກັບແຂວງ): ແກ້ໄດ້ສະເພາະ admin
create policy "w road_types"     on public.road_types        for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "w building_types" on public.building_types     for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "w conditions"     on public.building_conditions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "w settings"       on public.settings           for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ແຂວງ: admin ເທົ່ານັ້ນ (ເພີ່ມ/ລຶບ/ປ່ຽນຊື່ແຂວງ)
create policy "w provinces" on public.provinces for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ເມືອງ: ແກ້ໄດ້ຖ້າມີສິດໃນແຂວງນັ້ນ
create policy "w districts" on public.districts for all to authenticated
  using (public.can_access_province(province_id)) with check (public.can_access_province(province_id));

-- ບ້ານ: ແກ້ໄດ້ຖ້າມີສິດໃນແຂວງຂອງເມືອງນັ້ນ
create policy "w villages" on public.villages for all to authenticated
  using (public.can_access_province((select province_id from public.districts d where d.id = district_id)))
  with check (public.can_access_province((select province_id from public.districts d where d.id = district_id)));

-- ລາຄາດິນ: ແກ້ໄດ້ຖ້າມີສິດໃນແຂວງຂອງບ້ານນັ້ນ
create policy "w land_prices" on public.land_prices for all to authenticated
  using (public.can_access_province(public.village_province(village_id)))
  with check (public.can_access_province(public.village_province(village_id)));

-- ========================================================================
-- auto-create profile ຕອນມີຜູ້ໃຊ້ໃໝ່ (ດຶງ username/full_name ຈາກ metadata)
-- ========================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles (id, username, full_name, role)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
          coalesce(new.raw_user_meta_data->>'full_name', ''),
          coalesce(new.raw_user_meta_data->>'role', 'staff'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========================================================================
-- admin ອ່ານ/ຄົ້ນຫາ ການປະເມີນທຸກຄົນໄດ້ (ສຳລັບໜ້າປະຫວັດ) — staff ຍັງອ່ານໄດ້ສະເພາະຂອງຕົນ
-- ========================================================================
create policy "valuations admin read" on public.valuations
  for select to authenticated using (public.is_admin());
