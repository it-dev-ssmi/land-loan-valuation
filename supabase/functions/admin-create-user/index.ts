// ========================================================================
// supabase/functions/admin-create-user/index.ts
// Edge Function: ໃຫ້ admin ສ້າງ/ແກ້ ຜູ້ໃຊ້ (ຢູເຊີ+ລະຫັດ) + ກຳນົດແຂວງ
// ໃຊ້ service_role key (ຝັ່ງ server) — ບໍ່ເປີດເຜີຍໃຫ້ client
// ========================================================================
// Deploy:  supabase functions deploy admin-create-user
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ຖືກ inject ໃຫ້ອັດຕະໂນມັດ
// ========================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // 1) ກວດວ່າຜູ້ເອີ້ນເປັນ admin ຈິງ (ຈາກ token ຂອງເຂົາ)
    const authHeader = req.headers.get('Authorization') ?? '';
    const asCaller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: u } = await asCaller.auth.getUser();
    if (!u.user) return json({ error: 'ບໍ່ໄດ້ login' }, 401);
    const admin = createClient(url, serviceKey);
    const { data: prof } = await admin.from('profiles').select('role').eq('id', u.user.id).maybeSingle();
    if (prof?.role !== 'admin') return json({ error: 'ບໍ່ມີສິດ (admin ເທົ່ານັ້ນ)' }, 403);

    // 2) ຮັບຂໍ້ມູນ
    const body = await req.json();
    const { username, password, full_name, role = 'staff', province_ids = [] } = body;
    if (!username || !password) return json({ error: 'ຕ້ອງມີ ຢູເຊີ ແລະ ລະຫັດຜ່ານ' }, 400);
    const email = `${String(username).toLowerCase()}@ssmi.local`;

    // 3) ສ້າງ auth user (confirm email ໃຫ້ເລີຍ)
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { username, full_name: full_name ?? '', role },
    });
    if (cErr) return json({ error: cErr.message }, 400);
    const uid = created.user.id;

    // profile ຖືກສ້າງໂດຍ trigger ແລ້ວ — ຢືນຢັນ role/ຊື່ອີກຄັ້ງ
    await admin.from('profiles').upsert({ id: uid, username, full_name: full_name ?? '', role });

    // 4) ກຳນົດແຂວງ (staff)
    if (role !== 'admin' && Array.isArray(province_ids) && province_ids.length) {
      await admin.from('user_provinces').delete().eq('user_id', uid);
      await admin.from('user_provinces').insert(province_ids.map((pid: string) => ({ user_id: uid, province_id: pid })));
    }
    return json({ ok: true, user_id: uid, email });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
