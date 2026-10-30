// ========================================================================
// src/lib/auth.ts — ຕົວຊ່ວຍ auth + ສິດຕາມແຂວງ
// ========================================================================
import { supabase } from './supabaseClient';

// Supabase Auth ໃຊ້ email — ແປງ username ເປັນ email ພາຍໃນ
const DOMAIN = 'ssmi.local';
export function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@${DOMAIN}`;
}

export interface Me {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'staff';
  provinceIds: string[]; // ແຂວງທີ່ມີສິດ (admin = [] + isAdmin true = ທຸກແຂວງ)
  isAdmin: boolean;
}

/** ດຶງໂປຣໄຟລ໌ + ແຂວງທີ່ມີສິດ ຂອງຜູ້ໃຊ້ທີ່ login ຢູ່ */
export async function getMe(): Promise<Me | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: prof } = await supabase.from('profiles')
    .select('id,username,full_name,role').eq('id', auth.user.id).maybeSingle();
  if (!prof) return null;
  const isAdmin = prof.role === 'admin';
  let provinceIds: string[] = [];
  if (!isAdmin) {
    const { data: ups } = await supabase.from('user_provinces')
      .select('province_id').eq('user_id', auth.user.id);
    provinceIds = (ups ?? []).map((u: any) => u.province_id);
  }
  return {
    id: prof.id, username: prof.username, full_name: prof.full_name,
    role: prof.role, provinceIds, isAdmin,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
}
