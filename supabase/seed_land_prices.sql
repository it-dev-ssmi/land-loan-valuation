-- Seed ລາຄາດິນຈິງ ແຂວງຫຼວງພະບາງ (ແຍກຈາກ Google Sheets ຂອງຜູ້ໃຊ້)
-- ລັນຫຼັງ 0001_init.sql

-- ແຂວງ
insert into public.provinces (code, name_lo) values ('LPB', 'ຫຼວງພະບາງ') on conflict (code) do nothing;

do $$
declare v_prov uuid; v_dist uuid; v_vil uuid;
  rt_eak uuid; rt_cnt uuid; rt_jaek uuid; rt_orig uuid;
begin
  select id into v_prov from public.provinces where code='LPB';
  select id into rt_eak  from public.road_types where name_lo='ສາຍເອກ';
  select id into rt_cnt  from public.road_types where name_lo='ສາຍເຊື່ອມຕໍ່';
  select id into rt_jaek from public.road_types where name_lo='ສາຍແຈກ';
  select id into rt_orig from public.road_types where name_lo='ດັ້ງເດີມ';

  insert into public.districts (province_id, name_lo) values (v_prov, 'ເມືອງຫຼວງພະບາງ') returning id into v_dist;
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຊຽງທອງ-ຄີລີ', 1) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 2100000),
    (v_vil, rt_jaek, 1200000),
    (v_vil, rt_orig, 700000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂພນເຮືອງ', 2) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 2100000),
    (v_vil, rt_jaek, 1200000),
    (v_vil, rt_orig, 700000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານວັດໜອງ', 3) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 2100000),
    (v_vil, rt_jaek, 1200000),
    (v_vil, rt_orig, 700000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຂາມຢ່ອງ', 4) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1900000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 500000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປ່ອງຄຳ', 5) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1800000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 400000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານວັດທາດ', 6) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 2100000),
    (v_vil, rt_jaek, 1200000),
    (v_vil, rt_orig, 700000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານວັດແສນ', 7) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 2100000),
    (v_vil, rt_jaek, 1200000),
    (v_vil, rt_orig, 700000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂພນແພງ', 8) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1800000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 400000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫົວຊຽງ', 9) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 2100000),
    (v_vil, rt_jaek, 1200000),
    (v_vil, rt_orig, 700000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານທາດຫຼວງ', 10) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1700000),
    (v_vil, rt_jaek, 700000),
    (v_vil, rt_orig, 400000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານມະໂນ', 11) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1900000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 500000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານວຽງໄຊ', 12) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1900000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 500000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານວິຊຸນ', 13) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1800000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 500000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປ່າຂາມ', 14) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 2100000),
    (v_vil, rt_jaek, 1200000),
    (v_vil, rt_orig, 700000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານວຽງແກ້ວ', 15) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1900000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 500000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຈູມຄ້ອງ', 16) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 2100000),
    (v_vil, rt_jaek, 1200000),
    (v_vil, rt_orig, 700000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຊຽງມ່ວນ', 17) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 2100000),
    (v_vil, rt_jaek, 1200000),
    (v_vil, rt_orig, 700000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານທົ່ງຈະເລີນ', 18) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1900000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 500000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານອາຮາມ', 19) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1900000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 500000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານອາໄພ', 20) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1800000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 400000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໝື່ນນາ', 21) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1800000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 400000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານທາດໂບສົດ', 22) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 2500000),
    (v_vil, rt_cnt, 1300000),
    (v_vil, rt_jaek, 700000),
    (v_vil, rt_orig, 300000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານວຽງໃໝ່', 23) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 2500000),
    (v_vil, rt_cnt, 1300000),
    (v_vil, rt_jaek, 700000),
    (v_vil, rt_orig, 300000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນາວຽງຄຳ', 24) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1700000),
    (v_vil, rt_jaek, 700000),
    (v_vil, rt_orig, 300000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນາສຳພັນ', 25) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1700000),
    (v_vil, rt_jaek, 700000),
    (v_vil, rt_orig, 300000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານສາຍລົມ', 26) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1800000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 400000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານພະບາດໃຕ້', 27) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1800000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 400000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໜອງຄຳ', 28) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1500000),
    (v_vil, rt_cnt, 600000),
    (v_vil, rt_jaek, 250000),
    (v_vil, rt_orig, 90000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂພສີ', 29) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1800000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 400000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຄອຍ', 30) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1500000),
    (v_vil, rt_cnt, 600000),
    (v_vil, rt_jaek, 250000),
    (v_vil, rt_orig, 90000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຊຽງແກ້ວ', 31) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 350000),
    (v_vil, rt_jaek, 120000),
    (v_vil, rt_orig, 15000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານສັງຄະໂລກ', 32) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1500000),
    (v_vil, rt_cnt, 600000),
    (v_vil, rt_jaek, 250000),
    (v_vil, rt_orig, 80000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນາຊາງ', 33) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1100000),
    (v_vil, rt_cnt, 500000),
    (v_vil, rt_jaek, 200000),
    (v_vil, rt_orig, 80000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານມ້າ', 34) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1100000),
    (v_vil, rt_cnt, 500000),
    (v_vil, rt_jaek, 200000),
    (v_vil, rt_orig, 80000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນາຫຼວງ', 35) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1100000),
    (v_vil, rt_cnt, 500000),
    (v_vil, rt_jaek, 200000),
    (v_vil, rt_orig, 80000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານພູໝອກ', 36) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 350000),
    (v_vil, rt_jaek, 120000),
    (v_vil, rt_orig, 18000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນາເດືອຍ', 37) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 350000),
    (v_vil, rt_jaek, 120000),
    (v_vil, rt_orig, 18000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປົ່ງຫວ້ານ', 38) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 350000),
    (v_vil, rt_jaek, 120000),
    (v_vil, rt_orig, 18000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫຼັກແປດ', 39) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 220000),
    (v_vil, rt_jaek, 80000),
    (v_vil, rt_orig, 10000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຂົວທີ່ 1', 40) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 500000),
    (v_vil, rt_cnt, 200000),
    (v_vil, rt_jaek, 90000),
    (v_vil, rt_orig, 20000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫຼັກ 10', 41) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 200000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 20000),
    (v_vil, rt_orig, 4000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຜານົມ', 42) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1200000),
    (v_vil, rt_cnt, 800000),
    (v_vil, rt_jaek, 300000),
    (v_vil, rt_orig, 60000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານພອນໄຊ', 43) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1000000),
    (v_vil, rt_cnt, 500000),
    (v_vil, rt_jaek, 250000),
    (v_vil, rt_orig, 30000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານວັງເງິນ', 44) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1000000),
    (v_vil, rt_cnt, 500000),
    (v_vil, rt_jaek, 250000),
    (v_vil, rt_orig, 30000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານພິກນ້ອຍ', 45) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 250000),
    (v_vil, rt_cnt, 120000),
    (v_vil, rt_jaek, 25000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຊຽງລ້ອມ', 46) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 250000),
    (v_vil, rt_cnt, 120000),
    (v_vil, rt_jaek, 25000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານພິກໃຫຍ່', 47) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 80000),
    (v_vil, rt_jaek, 20000),
    (v_vil, rt_orig, 4000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານພູຊ້າງຄຳ', 48) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1000000),
    (v_vil, rt_cnt, 500000),
    (v_vil, rt_jaek, 250000),
    (v_vil, rt_orig, 30000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫາດຮ່ຽນ', 49) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1000000),
    (v_vil, rt_cnt, 500000),
    (v_vil, rt_jaek, 250000),
    (v_vil, rt_orig, 30000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານພູເຫຼັກຈະເລີນ', 50) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1000000),
    (v_vil, rt_cnt, 500000),
    (v_vil, rt_jaek, 250000),
    (v_vil, rt_orig, 30000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຜາສຸກ', 51) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 1000000),
    (v_vil, rt_jaek, 400000),
    (v_vil, rt_orig, 120000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານເມືອງງາ', 52) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1800000),
    (v_vil, rt_cnt, 1200000),
    (v_vil, rt_jaek, 600000),
    (v_vil, rt_orig, 150000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານພັນຫຼວງ', 53) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1500000),
    (v_vil, rt_cnt, 1200000),
    (v_vil, rt_jaek, 600000),
    (v_vil, rt_orig, 150000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໜອງຊາຍ', 54) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1500000),
    (v_vil, rt_cnt, 900000),
    (v_vil, rt_jaek, 400000),
    (v_vil, rt_orig, 120000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຊ່າງຄ້ອງ', 55) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1500000),
    (v_vil, rt_cnt, 900000),
    (v_vil, rt_jaek, 400000),
    (v_vil, rt_orig, 120000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຊຽງເຫຼັກ', 56) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1500000),
    (v_vil, rt_cnt, 900000),
    (v_vil, rt_jaek, 400000),
    (v_vil, rt_orig, 120000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂພນສະອາດ', 57) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1500000),
    (v_vil, rt_cnt, 900000),
    (v_vil, rt_jaek, 400000),
    (v_vil, rt_orig, 120000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານແສນສຸກ', 58) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 6000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຜາໂອ', 59) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 6000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານດອນເກົ່າ', 60) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1300000),
    (v_vil, rt_cnt, 800000),
    (v_vil, rt_jaek, 300000),
    (v_vil, rt_orig, 100000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານດອນໃໝ່', 61) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1300000),
    (v_vil, rt_cnt, 800000),
    (v_vil, rt_jaek, 300000),
    (v_vil, rt_orig, 100000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານດອນແກ້ວ', 62) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1200000),
    (v_vil, rt_cnt, 800000),
    (v_vil, rt_jaek, 300000),
    (v_vil, rt_orig, 60000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານດອນກາງ', 63) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 500000),
    (v_vil, rt_cnt, 200000),
    (v_vil, rt_jaek, 90000),
    (v_vil, rt_orig, 20000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຄົກວ່າ', 64) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1300000),
    (v_vil, rt_cnt, 800000),
    (v_vil, rt_jaek, 300000),
    (v_vil, rt_orig, 100000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຜາໂຄມ', 65) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1300000),
    (v_vil, rt_cnt, 800000),
    (v_vil, rt_jaek, 300000),
    (v_vil, rt_orig, 100000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂຄມຂວາງ', 66) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 1300000),
    (v_vil, rt_cnt, 800000),
    (v_vil, rt_jaek, 300000),
    (v_vil, rt_orig, 100000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປ່ອງຄຳ', 67) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1700000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 400000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂພນແພງ', 68) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 3000000),
    (v_vil, rt_cnt, 1700000),
    (v_vil, rt_jaek, 800000),
    (v_vil, rt_orig, 400000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນາສ້າງເຫວີຍ', 69) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 15000000),
    (v_vil, rt_cnt, 800000),
    (v_vil, rt_jaek, 300000),
    (v_vil, rt_orig, 60000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນູນສະຫວາດ', 70) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 250000),
    (v_vil, rt_cnt, 120000),
    (v_vil, rt_jaek, 25000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານແດນສະຫວ່າງ', 71) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 80000),
    (v_vil, rt_jaek, 20000),
    (v_vil, rt_orig, 4000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຊາດ', 72) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 90000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນາໄຊ', 73) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 90000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປາກເຊືອງ', 74) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 6000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນາຊາວ', 75) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 160000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 10000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຖິ່ນຊົມ', 76) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 150000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 9000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຖິ່ນແກ້ວ', 77) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 150000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 9000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານເມືອງຂາຍ', 78) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 150000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 9000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານວຽງສະຫວັນ', 79) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 6000);

  insert into public.districts (province_id, name_lo) values (v_prov, 'ເມືອງປາກອູ') returning id into v_dist;
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານສົມສະນຸກ', 1) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 120000),
    (v_vil, rt_cnt, 80000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 4000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫາດຍາ', 2) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 120000),
    (v_vil, rt_cnt, 80000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 4000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫາດຄໍ້', 3) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 120000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 4000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຊ່າງໄຫ', 4) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 150000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 60000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຖິ່ນຈະເລີນ', 5) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 80000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 2500);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານລາດທ່າແຮ່', 6) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 100000),
    (v_vil, rt_jaek, 35000),
    (v_vil, rt_orig, 3000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານ ຫາດມາດ', 7) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 60000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານ ຖິ່ນຈະເລີນ', 8) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 80000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 2500);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂພນສະຫວ່າງ', 9) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 80000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 2500);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂພນໂຮມ', 10) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 80000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 2500);

  insert into public.districts (province_id, name_lo) values (v_prov, 'ເມືອງຈອມເພັດ') returning id into v_dist;
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຊຽງແມນ', 1) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 120000),
    (v_vil, rt_cnt, 30000),
    (v_vil, rt_jaek, 10000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂພລາດ', 2) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 120000),
    (v_vil, rt_cnt, 30000),
    (v_vil, rt_jaek, 10000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານບວມເລົາ', 3) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 120000),
    (v_vil, rt_cnt, 30000),
    (v_vil, rt_jaek, 10000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນາທ່າ', 4) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 120000),
    (v_vil, rt_cnt, 30000),
    (v_vil, rt_jaek, 10000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຈານເໜືອ-ໃຕ້', 5) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 30000),
    (v_vil, rt_jaek, 15000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປາກຫຼຶງ', 6) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 50000),
    (v_vil, rt_cnt, 30000),
    (v_vil, rt_jaek, 15000),
    (v_vil, rt_orig, 5000);

  insert into public.districts (province_id, name_lo) values (v_prov, 'ເມືອງຊຽງເງິນ') returning id into v_dist;
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປາກແວດ', 1) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_cnt, 120000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 10000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປາກຂັນ', 2) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_cnt, 120000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 10000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານ ຊຽງເງິນ', 3) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_cnt, 120000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 10000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານສາມັກຄີໄຊ', 4) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_cnt, 120000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 10000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານມູດ', 5) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_cnt, 80000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 7000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານດອນໂມ', 6) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 80000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 7000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານແອນສະຫວັນ', 7) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 6000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານສວນຫຼວງ', 8) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 6000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານ ລ້ອງອໍ້', 9) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_cnt, 80000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 6000);

  insert into public.districts (province_id, name_lo) values (v_prov, 'ເມືອງນານ') returning id into v_dist;
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານສີມຸງຄຸນ', 1) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 250000),
    (v_vil, rt_cnt, 120000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 10000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປ່າໄຜ່', 2) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 250000),
    (v_vil, rt_cnt, 120000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນາຝາຍ', 3) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 180000),
    (v_vil, rt_cnt, 80000),
    (v_vil, rt_jaek, 20000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານທົ່ງພຽງວິໄລ', 4) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 200000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 7000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານສີບຸນເຮືອງ', 5) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 120000),
    (v_vil, rt_jaek, 20000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານດອກຕູມ', 6) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 20000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານທາດ', 7) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 250000),
    (v_vil, rt_cnt, 120000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 10000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂພນຫີນ', 8) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 250000),
    (v_vil, rt_cnt, 120000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນາເຄີນ', 9) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 200000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 7000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານສີວິໄລ', 10) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 200000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 7000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປາກຄອນ', 11) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 200000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 7000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂພນ', 12) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 120000),
    (v_vil, rt_jaek, 20000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນາເມືອງກາງ', 13) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 30000),
    (v_vil, rt_jaek, 5000),
    (v_vil, rt_orig, 1000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫ້ວຍລາດ', 14) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 30000),
    (v_vil, rt_jaek, 5000),
    (v_vil, rt_orig, 1000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຜາຫນີບ', 15) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 100000),
    (v_vil, rt_jaek, 15000),
    (v_vil, rt_orig, 3000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປົ່ງດົງ', 16) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 100000),
    (v_vil, rt_jaek, 15000),
    (v_vil, rt_orig, 3000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຜາຢວກ', 17) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 80000),
    (v_vil, rt_jaek, 5000),
    (v_vil, rt_orig, 1000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫ້ວຍຫອຍ', 18) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 80000),
    (v_vil, rt_jaek, 15000),
    (v_vil, rt_orig, 3000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນາເມືອງໃຫຍ່', 19) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 80000),
    (v_vil, rt_jaek, 15000),
    (v_vil, rt_orig, 3000);

  insert into public.districts (province_id, name_lo) values (v_prov, 'ເມືອງໂພນໄຊ') returning id into v_dist;
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປາກງາ', 1) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 100000),
    (v_vil, rt_cnt, 70000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 2000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານທ່າໂພ', 2) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 35000),
    (v_vil, rt_cnt, 20000),
    (v_vil, rt_jaek, 5000),
    (v_vil, rt_orig, 1000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫ້ວຍລຸ່ງເທິງ', 3) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 35000),
    (v_vil, rt_cnt, 20000),
    (v_vil, rt_jaek, 5000),
    (v_vil, rt_orig, 1000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫ້ວຍມັນ', 4) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 35000),
    (v_vil, rt_cnt, 20000),
    (v_vil, rt_jaek, 5000),
    (v_vil, rt_orig, 1000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຜາແຕ້ມ', 5) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 15000),
    (v_vil, rt_cnt, 8000),
    (v_vil, rt_jaek, 5000),
    (v_vil, rt_orig, 1000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫ້ວຍສາລາ', 6) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 20000),
    (v_vil, rt_cnt, 10000),
    (v_vil, rt_jaek, 5000),
    (v_vil, rt_orig, 1000);

  insert into public.districts (province_id, name_lo) values (v_prov, 'ເມືອງປາກແຊງ') returning id into v_dist;
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປາກແຊງ', 1) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 100000),
    (v_vil, rt_cnt, 80000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 2000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານບວມພະແສງ', 2) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 100000),
    (v_vil, rt_cnt, 80000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 2000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫາດພະອົດ', 3) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 70000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 1000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານສົບແຈກ', 4) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 80000),
    (v_vil, rt_jaek, 35000),
    (v_vil, rt_orig, 1500);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໜອງຟ້າແດດ', 5) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 70000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 1000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫາດຊໍາ', 6) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 20000),
    (v_vil, rt_jaek, 15000),
    (v_vil, rt_orig, 1000);

  insert into public.districts (province_id, name_lo) values (v_prov, 'ເມືອງນ້ຳບາກ') returning id into v_dist;
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຟ້າ', 1) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 170000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 8000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂພນສະອາດ', 2) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 170000),
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 8000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານທ່າລີໃຕ້', 3) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 100000),
    (v_vil, rt_jaek, 35000),
    (v_vil, rt_orig, 7000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານບົມ', 4) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 150000),
    (v_vil, rt_cnt, 90000),
    (v_vil, rt_jaek, 35000),
    (v_vil, rt_orig, 7000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປາກມອງ', 5) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_jaek, 60000),
    (v_vil, rt_orig, 7000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂພນສະຫວັນ', 6) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 220000),
    (v_vil, rt_cnt, 150000),
    (v_vil, rt_jaek, 70000),
    (v_vil, rt_orig, 7000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນ້ຳຖ້ວມໃຕ້-ເໜືອ', 7) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 250000),
    (v_vil, rt_cnt, 180000),
    (v_vil, rt_jaek, 80000),
    (v_vil, rt_orig, 7000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານນະຄອນ', 8) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 150000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 8000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫົວນາ', 9) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 200000),
    (v_vil, rt_cnt, 150000),
    (v_vil, rt_jaek, 70000),
    (v_vil, rt_orig, 7000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂຄ້ງ', 10) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 80000),
    (v_vil, rt_jaek, 35000),
    (v_vil, rt_orig, 7000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂພນໄຊ', 11) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_cnt, 80000),
    (v_vil, rt_jaek, 35000),
    (v_vil, rt_orig, 7000);

  insert into public.districts (province_id, name_lo) values (v_prov, 'ເມືອງງອຍ') returning id into v_dist;
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໜອງຂຽວ', 1) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 130000),
    (v_vil, rt_cnt, 80000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 5000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານພູຕີນເຜິ້ງ', 2) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 60000),
    (v_vil, rt_cnt, 40000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 2000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານປາກບາກ', 3) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 100000),
    (v_vil, rt_jaek, 50000),
    (v_vil, rt_orig, 4000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໜອງອ່ຽນ', 4) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 80000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 4000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານຫ້ວຍເຫຼັກ', 5) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 80000),
    (v_vil, rt_jaek, 40000),
    (v_vil, rt_orig, 4000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານໂດນ', 6) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 50000),
    (v_vil, rt_cnt, 40000),
    (v_vil, rt_jaek, 20000),
    (v_vil, rt_orig, 3000);
  insert into public.villages (district_id, name_lo, seq) values (v_dist, 'ບ້ານພູຫຼວງ', 7) returning id into v_vil;
  insert into public.land_prices (village_id, road_type_id, price_per_m2) values
    (v_vil, rt_eak, 60000),
    (v_vil, rt_jaek, 30000),
    (v_vil, rt_orig, 2000);
end $$;
