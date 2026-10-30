-- ========================================================================
-- ລະບົບປະເມີນທີ່ດິນ + ສິ່ງປຸກສ້າງ ເພື່ອຄຳນວນວົງເງິນປ່ອຍກູ້
-- Supabase / PostgreSQL schema  (ປັບຕາມໂຄງສ້າງຂໍ້ມູນຈິງ: ເມືອງ → ບ້ານ → ປະເພດທາງ)
-- ========================================================================
-- ລາຄາດິນ "ດຶງຈາກຖານຂໍ້ມູນ": ຂຶ້ນກັບ (ບ້ານ × ປະເພດທາງ) ຢູ່ຕາຕະລາງ land_prices.
-- % ປ່ອຍກູ້ຕັ້ງຢູ່ຕາຕະລາງ road_types (ແຕ່ລະປະເພດທາງ). ປ່ຽນໄດ້ໂດຍບໍ່ແຕະໂຄ້ດ.
-- ========================================================================

create extension if not exists "pgcrypto";

-- ແຂວງ
create table if not exists public.provinces (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name_lo text not null,
  created_at timestamptz not null default now()
);

-- ເມືອງ
create table if not exists public.districts (
  id uuid primary key default gen_random_uuid(),
  province_id uuid not null references public.provinces(id) on delete cascade,
  name_lo text not null,
  created_at timestamptz not null default now()
);

-- ບ້ານ
create table if not exists public.villages (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references public.districts(id) on delete cascade,
  name_lo text not null,
  seq int,
  created_at timestamptz not null default now()
);

-- ປະເພດທາງ (ສາຍເອກ / ສາຍເຊື່ອມຕໍ່ / ສາຍແຈກ / ດັ້ງເດີມ) — ຖື % ປ່ອຍກູ້ຂອງດິນ
create table if not exists public.road_types (
  id uuid primary key default gen_random_uuid(),
  name_lo text not null unique,
  sort_order int not null default 0,
  ltv_pct numeric(5,2) not null default 0  -- % ປ່ອຍກູ້ຂອງມູນຄ່າດິນ
);

-- ລາຄາດິນ: ຕໍ່ (ບ້ານ × ປະເພດທາງ) — ກີບ/ຕາແມັດ
create table if not exists public.land_prices (
  id uuid primary key default gen_random_uuid(),
  village_id uuid not null references public.villages(id) on delete cascade,
  road_type_id uuid not null references public.road_types(id) on delete cascade,
  price_per_m2 numeric(18,2) not null,
  unique (village_id, road_type_id)
);

-- ສະພາບ/ອາຍຸ ສິ່ງປຸກສ້າງ — ຕົວຄູນຄ່າຫຼຸ້ຍຫ້ຽນ (depreciation factor, %)
create table if not exists public.building_conditions (
  id uuid primary key default gen_random_uuid(),
  name_lo text not null,
  factor_pct numeric(5,2) not null default 100, -- 100 = ໃໝ່, ຕ່ຳລົງຕາມສະພາບ
  sort_order int not null default 0
);

-- ການຕັ້ງຄ່າລະບົບ (ເຊັ່ນ ວົງເງິນສູງສຸດ) — key/value
create table if not exists public.settings (
  key text primary key,
  value_num numeric(18,2),
  value_text text,
  note text
);

-- ປະເພດສິ່ງປຸກສ້າງ — ມູນຄ່າກໍ່ສ້າງ/ຕ.ມ. ແລະ % ປ່ອຍກູ້
create table if not exists public.building_types (
  id uuid primary key default gen_random_uuid(),
  name_lo text not null,
  price_per_m2 numeric(18,2) not null default 0,
  ltv_pct numeric(5,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ບັນທຶກຜົນການປະເມີນ (ເກັບ snapshot ຂອງລາຄາ/% ຕອນນັ້ນ)
create table if not exists public.valuations (
  id uuid primary key default gen_random_uuid(),
  borrower_first_name text,
  borrower_last_name text,
  village_id uuid references public.villages(id),
  road_type_id uuid references public.road_types(id),
  land_price_per_m2 numeric(18,2) not null,
  land_ltv_pct numeric(5,2) not null,
  land_area_m2 numeric(18,2) not null,
  land_value numeric(18,2) not null,
  land_loan numeric(18,2) not null,
  building_type_id uuid references public.building_types(id),
  building_condition_id uuid references public.building_conditions(id),
  condition_factor numeric(5,2) not null default 100,
  completion_pct numeric(5,2) not null default 100,
  building_area_m2 numeric(18,2),
  building_value numeric(18,2) not null default 0,
  building_loan numeric(18,2) not null default 0,
  land_multiplier numeric(6,2) not null default 1,
  building_multiplier numeric(6,2) not null default 1,
  fee_location text,
  fee_distance_km numeric(8,2),
  service_fee numeric(18,2) not null default 0,
  assess_fee numeric(18,2) not null default 0,
  total_fee numeric(18,2) not null default 0,
  total_value numeric(18,2) not null,
  total_loan numeric(18,2) not null,
  actual_loan numeric(18,2),
  title_doc_urls text[],   -- ລິ້ງຮູບໃບຕາດິນ/ຫຼັກຊັບ (Supabase Storage)
  doc_no text unique,      -- ເລກທີ່ເອກະສານ (ຂຶ້ນຕົ້ນລະຫັດແຂວງ ເຊັ່ນ LPB-20260101-001)
  note text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_districts_province on public.districts(province_id);
create index if not exists idx_villages_district  on public.villages(district_id);
create index if not exists idx_land_prices_village on public.land_prices(village_id);

-- ---- ອາຍຸ / ຄ່າຫຼຸ້ຍຫ້ຽນ ສິ່ງປຸກສ້າງ (ຕາມເອກະສານ — ປ່ຽນໄດ້) ----
insert into public.building_conditions (name_lo, factor_pct, sort_order) values
  ('ອາຍຸ 1–3 ປີ', 80, 1),
  ('ອາຍຸ 3–10 ປີ', 60, 2),
  ('ອາຍຸ 10–15 ປີ', 40, 3),
  ('ອາຍຸ ຫຼາຍກວ່າ 15 ປີ', 20, 4);

-- ---- ການຕັ້ງຄ່າ (ວົງເງິນສູງສຸດ: ວ່າງ = ບໍ່ຈຳກັດ) ----
insert into public.settings (key, value_num, note) values
  ('max_loan', null, 'ວົງເງິນປ່ອຍກູ້ສູງສຸດຕໍ່ລາຍການ (ວ່າງ = ບໍ່ຈຳກັດ)'),
  ('extra_mult_land', 2, 'ຕົວຄູນພິເສດຂອງດິນ (ເຊັ່ນ 2 = ຄູນສອງ)'),
  ('extra_mult_building', 2, 'ຕົວຄູນພິເສດຂອງສິ່ງປຸກສ້າງ (ເຊັ່ນ 2 = ຄູນສອງ)'),
  -- ຄ່າທຳນຽມ (ມາດຕາ 6)
  ('fee_service_threshold', 50000000, '6.1 ວົງເງິນຂັ້ນແບ່ງ % ຄ່າບໍລິການ'),
  ('fee_service_rate_low', 1, '6.1 % ຄ່າບໍລິການ ວົງເງິນ ≤ threshold'),
  ('fee_service_rate_high', 0.5, '6.1 % ຄ່າບໍລິການ ວົງເງິນ > threshold'),
  ('fee_assess_in_town', 300000, '6.2 ຄ່າລົງປະເມີນ ໃນເມືອງ'),
  ('fee_assess_tier1', 400000, '6.2 ຄ່າລົງປະເມີນ ຕ່າງເມືອງ ≤ dist1'),
  ('fee_assess_tier2', 600000, '6.2 ຄ່າລົງປະເມີນ dist1–dist2'),
  ('fee_assess_tier3', 800000, '6.2 ຄ່າລົງປະເມີນ > dist2'),
  ('fee_assess_dist1', 30, '6.2 ຂັ້ນໄລຍະທາງ 1 (km)'),
  ('fee_assess_dist2', 80, '6.2 ຂັ້ນໄລຍະທາງ 2 (km)')
on conflict (key) do nothing;

-- ໂລໂກ້ ແລະ ຊື່ສະຖາບັນ (ເກັບເປັນ text: data URL ຫຼື URL)
insert into public.settings (key, value_text, note) values
  ('logo_url', null, 'ໂລໂກ້ສະຖາບັນ (data URL ຫຼື https URL)'),
  ('inst_name', null, 'ຊື່ສະຖາບັນ')
on conflict (key) do nothing;

-- ---- ປະເພດທາງ (4 ຄ່າຄົງທີ່) + % ປ່ອຍກູ້ເລີ່ມຕົ້ນ (ປ່ຽນໄດ້) ----
insert into public.road_types (name_lo, sort_order, ltv_pct) values
  ('ສາຍເອກ', 1, 70),
  ('ສາຍເຊື່ອມຕໍ່', 2, 65),
  ('ສາຍແຈກ', 3, 60),
  ('ດັ້ງເດີມ', 4, 50)
on conflict (name_lo) do nothing;

-- ---- ປະເພດສິ່ງປຸກສ້າງ (ຕາມເອກະສານ — ລາຄາ/ຕ.ມ.) ----
-- ໝາຍເຫດ: ເຮືອນ 2 ຊັ້ນ ຄິດແຍກແຕ່ລະສ່ວນ (ເຊັ່ນ ຊັ້ນລຸ່ມເຮືອນປູນ + ຊັ້ນເທິງເຮືອນໄມ້) ແລ້ວລວມກັນ
-- ltv_pct = % ປ່ອຍກູ້ຂອງມູນຄ່າສິ່ງປຸກສ້າງ (ຄ່າເລີ່ມຕົ້ນ — ປັບຕາມນະໂຍບາຍ)
insert into public.building_types (name_lo, price_per_m2, ltv_pct) values
  ('ເຮືອນ (ປູນ/ຄອນກີດ)', 1500000, 60),
  ('ເຮືອນໄມ້', 500000, 50);

-- ========================================================================
-- RLS
-- ========================================================================
alter table public.provinces      enable row level security;
alter table public.districts      enable row level security;
alter table public.villages       enable row level security;
alter table public.road_types     enable row level security;
alter table public.land_prices    enable row level security;
alter table public.building_types enable row level security;
alter table public.building_conditions enable row level security;
alter table public.settings       enable row level security;
alter table public.valuations     enable row level security;

create policy "read provinces"  on public.provinces      for select to authenticated using (true);
create policy "read districts"  on public.districts      for select to authenticated using (true);
create policy "read villages"   on public.villages       for select to authenticated using (true);
create policy "read roadtypes"  on public.road_types     for select to authenticated using (true);
create policy "read landprices" on public.land_prices    for select to authenticated using (true);
create policy "read buildings"  on public.building_types for select to authenticated using (true);
create policy "read conditions" on public.building_conditions for select to authenticated using (true);
create policy "read settings"   on public.settings       for select to authenticated using (true);

create policy "valuations insert own" on public.valuations
  for insert to authenticated with check (created_by = auth.uid());
create policy "valuations read own"   on public.valuations
  for select to authenticated using (created_by = auth.uid());

-- ========================================================================
-- ສິດແກ້ຂໍ້ມູນ (ສຳລັບໜ້າ admin)
-- ຕົວຢ່າງນີ້ອະນຸຍາດໃຫ້ຜູ້ login ທຸກຄົນແກ້ໄດ້ ເພື່ອໃຫ້ admin ໃຊ້ງານໄດ້ທັນທີ.
-- *** ໃນການນຳໃຊ້ຈິງ: ຈຳກັດໃຫ້ສະເພາະ role 'admin' ***  (ເບິ່ງ ADMIN.md)
-- ========================================================================
do $$
declare t text;
begin
  foreach t in array array['provinces','districts','villages','road_types',
      'land_prices','building_types','building_conditions','settings']
  loop
    execute format($f$create policy "admin write %1$s" on public.%1$I
      for all to authenticated using (true) with check (true);$f$, t);
  end loop;
end $$;
