-- ========================================================================
-- 0003_storage.sql — bucket ສຳລັບຮູບໃບຕາດິນ/ຫຼັກຊັບ
-- ລັນໃນ Supabase SQL Editor (ຫຼືສ້າງ bucket ຜ່ານ Dashboard → Storage)
-- ========================================================================

-- ສ້າງ bucket 'title-docs' (public ເພື່ອສະແດງຮູບໄດ້ງ່າຍ)
insert into storage.buckets (id, name, public)
values ('title-docs', 'title-docs', true)
on conflict (id) do nothing;

-- ຜູ້ login ອັບໂຫຼດໄດ້
create policy "title-docs upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'title-docs');

-- ອ່ານ (ສາທາລະນະ — ຍ້ອນ bucket public; ຖ້າຢາກຈຳກັດ ໃຫ້ຕັ້ງ public=false ແລ້ວເພີ່ມ policy select)
create policy "title-docs read" on storage.objects
  for select to public using (bucket_id = 'title-docs');

-- ເຈົ້າຂອງລຶບ/ແກ້ໄຟລ໌ຕົນເອງໄດ້
create policy "title-docs manage own" on storage.objects
  for all to authenticated
  using (bucket_id = 'title-docs' and owner = auth.uid())
  with check (bucket_id = 'title-docs' and owner = auth.uid());
