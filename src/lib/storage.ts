// ========================================================================
// src/lib/storage.ts — ຮູບໃບຕາດິນ/ຫຼັກຊັບ ໃນ Supabase Storage (bucket private)
// ເກັບ path (<user_id>/<ເວລາ>-<ຊື່ໄຟລ໌>) ໄວ້ໃນ valuations.title_doc_urls
// ເປີດເບິ່ງຜ່ານ signed URL ທີ່ໝົດອາຍຸ (ເບິ່ງ supabase/0004_storage_private.sql)
// ========================================================================
import { supabase } from './supabaseClient';

export const DOC_BUCKET = 'ssmilaos_1';
export const DOC_MAX_BYTES = 20 * 1024 * 1024; // ກົງກັບ file_size_limit ຂອງ bucket

/** ອັບໂຫຼດຮູບ → ຄືນ path ທີ່ສຳເລັດ ແລະ ຊື່ໄຟລ໌ທີ່ລົ້ມເຫຼວ */
export async function uploadDocs(userId: string, files: File[]) {
  const paths: string[] = [];
  const failed: string[] = [];
  for (const f of files) {
    const path = `${userId}/${Date.now()}-${f.name.replace(/[^\w.]/g, '_')}`;
    const { error } = await supabase.storage.from(DOC_BUCKET).upload(path, f, { contentType: f.type });
    if (error) failed.push(`${f.name} (${error.message})`);
    else paths.push(path);
  }
  return { paths, failed };
}

/** path → signed URL (ໝົດອາຍຸຫຼັງ expiresIn ວິນາທີ) */
export async function signedDocUrls(paths: string[], expiresIn = 60 * 60) {
  if (!paths.length) return [];
  const { data, error } = await supabase.storage.from(DOC_BUCKET).createSignedUrls(paths, expiresIn);
  if (error) throw error;
  return (data ?? []).map(d => d.signedUrl).filter((u): u is string => !!u);
}
