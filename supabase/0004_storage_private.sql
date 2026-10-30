-- ========================================================================
-- 0004_storage_private.sql — ເກັບຮູບໃບຕາດິນ/ຫຼັກຊັບ ໃນ bucket private 'ssmilaos_1'
-- ລັນຫຼັງ 0002_auth.sql (ໃຊ້ public.is_admin()).
-- bucket ເປັນ private → ແອັບເກັບ path ໄວ້ໃນ valuations.title_doc_urls
-- ແລ້ວສ້າງ signed URL (ໝົດອາຍຸ) ຕອນເປີດເບິ່ງ
-- ========================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('ssmilaos_1', 'ssmilaos_1', false, 20971520)   -- 20 MB/ໄຟລ໌
on conflict (id) do nothing;

drop policy if exists "ssmilaos_1 upload"     on storage.objects;
drop policy if exists "ssmilaos_1 read"       on storage.objects;
drop policy if exists "ssmilaos_1 delete own" on storage.objects;

-- ຜູ້ login ອັບໂຫຼດໄດ້ — ສະເພາະໃນໂຟນເດີຂອງຕົນເອງ (<user_id>/...)
create policy "ssmilaos_1 upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'ssmilaos_1' and (storage.foldername(name))[1] = auth.uid()::text);

-- ອ່ານ: ເຈົ້າຂອງໄຟລ໌ ຫຼື admin
create policy "ssmilaos_1 read" on storage.objects
  for select to authenticated
  using (bucket_id = 'ssmilaos_1' and (owner_id = auth.uid()::text or public.is_admin()));

-- ລຶບ: ເຈົ້າຂອງໄຟລ໌ ຫຼື admin
create policy "ssmilaos_1 delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'ssmilaos_1' and (owner_id = auth.uid()::text or public.is_admin()));
