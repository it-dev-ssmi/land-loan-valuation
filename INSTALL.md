# 📦 ຄູ່ມືຕິດຕັ້ງລະບົບ — ປະເມີນທີ່ດິນ → ວົງເງິນປ່ອຍກູ້ (SSMI)

Next.js + Supabase. ເຮັດຕາມ 7 ຂັ້ນຕອນນີ້ຕາມລຳດັບ ຈະໃຊ້ໄດ້.

---

## 0. ສິ່ງທີ່ຕ້ອງມີກ່ອນ

- **Node.js 18 ຂຶ້ນໄປ** (ດາວໂຫຼດ: https://nodejs.org) — ກວດດ້ວຍ `node -v`
- **ບັນຊີ Supabase** (ຟຣີ): https://supabase.com
- (ທາງເລືອກ) **Supabase CLI** — ຈຳເປັນສະເພາະຕອນ deploy edge function (ຂັ້ນຕອນ 5)

---

## 1. ແຕກໄຟລ໌ ແລະ ຕິດຕັ້ງ package

```bash
# ແຕກ land-loan-valuation.zip ແລ້ວເຂົ້າໂຟນເດີ
cd land-loan-valuation
npm install
```

---

## 2. ສ້າງໂປຣເຈັກ Supabase

1. ເຂົ້າ https://supabase.com → **New project** → ຕັ້ງຊື່ + ລະຫັດ database (ຈື່ໄວ້)
2. ລໍຖ້າສ້າງແລ້ວ ໄປ **Project Settings → API** ເອົາ 2 ຄ່ານີ້:
   - **Project URL** (ເຊັ່ນ `https://abcd.supabase.co`)
   - **anon public key** (ຄີຍາວໆ)

---

## 3. ສ້າງຕາຕະລາງ ແລະ ນຳເຂົ້າຂໍ້ມູນ (SQL)

ໄປທີ່ **SQL Editor** ໃນ Supabase → ວາງເນື້ອໃນຂອງແຕ່ລະໄຟລ໌ແລ້ວກົດ **Run** **ຕາມລຳດັບນີ້**:

| ລຳດັບ | ໄຟລ໌ | ເຮັດຫຍັງ |
|---|---|---|
| 1 | `supabase/0001_init.sql` | ສ້າງຕາຕະລາງຫຼັກ (ແຂວງ, ເມືອງ, ບ້ານ, ລາຄາ, ຄ່າທຳນຽມ, valuations) |
| 2 | `supabase/seed_land_prices.sql` | ນຳເຂົ້າລາຄາດິນຫຼວງພະບາງ (9 ເມືອງ · 153 ບ້ານ · 566 ຈຸດລາຄາ) |
| 3 | `supabase/0002_auth.sql` | ລະບົບ login + ແຍກສິດຕາມແຂວງ (RLS) |
| 4 | `supabase/0003_storage.sql` | ສ້າງບ່ອນເກັບຮູບໃບຕາດິນ (bucket `title-docs`) |

> ⚠ ຕ້ອງລັນຕາມລຳດັບ 1→2→3→4. ຖ້າຂ້າມ 0002 ລະບົບ login ຈະໃຊ້ບໍ່ໄດ້.

---

## 4. ຕັ້ງຄ່າ .env.local ແລ້ວລອງລັນ

```bash
cp .env.local.example .env.local
```

ເປີດ `.env.local` ໃສ່ຄ່າຈາກຂັ້ນຕອນ 2:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ຄີ-anon-ຂອງເຈົ້າ
```

ລອງລັນ:

```bash
npm run dev
```

ເປີດ http://localhost:3000 — ຄວນເຫັນໜ້າ login (ຍັງເຂົ້າບໍ່ໄດ້ ເພາະຍັງບໍ່ມີຜູ້ໃຊ້ → ໄປຂັ້ນຕອນ 6)

---

## 5. Deploy Edge Function (ສຳລັບ admin ສ້າງຜູ້ໃຊ້ໃນແອັບ)

ຟັງຊັນນີ້ໃຫ້ admin ສ້າງ user+ລະຫັດ ຂອງພະນັກງານໄດ້ຈາກໃນແອັບ (ໃຊ້ service_role key ຢູ່ຝັ່ງ server).

```bash
npm i -g supabase          # ຕິດຕັ້ງ CLI (ເທື່ອດຽວ)
supabase login             # login ດ້ວຍ token ຈາກ supabase.com
supabase link --project-ref <project-ref>   # ref ຢູ່ Project Settings → General
supabase functions deploy admin-create-user
```

> `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` ຖືກ inject ໃຫ້ອັດຕະໂນມັດ.
> ຖ້າຟັງຊັນແຈ້ງຫາ anon key ບໍ່ເຫັນ ໃຫ້ຕັ້ງເອງ:
> `supabase secrets set SUPABASE_ANON_KEY=ຄີ-anon-ຂອງເຈົ້າ`

**ຖ້າຍັງບໍ່ Deploy ຟັງຊັນນີ້:** ແອັບຍັງໃຊ້ໄດ້ປົກກະຕິ ແຕ່ການສ້າງຜູ້ໃຊ້ຈາກໃນໜ້າ admin ຈະບໍ່ທຳງານ —
ໃຫ້ສ້າງຜູ້ໃຊ້ຜ່ານ Supabase Dashboard ແທນ (ວິທີຢູ່ຂັ້ນຕອນ 6).

---

## 6. ສ້າງ admin ຄົນທຳອິດ (bootstrap)

ການສ້າງຜູ້ໃຊ້ໃນແອັບຕ້ອງເປັນ admin ກ່ອນ — ສະນັ້ນ admin ຄົນທຳອິດຕ້ອງສ້າງດ້ວຍມື:

1. Supabase → **Authentication → Users → Add user**
   - **Email:** `admin@ssmi.local`  (ຮູບແບບ `ຢູເຊີ@ssmi.local`)
   - **Password:** ຕັ້ງລະຫັດ
   - ✅ ຕິກ **Auto Confirm User**
2. ໄປ **SQL Editor** ລັນຄຳສັ່ງນີ້ ເພື່ອຍົກໃຫ້ເປັນ admin:
   ```sql
   update public.profiles set role = 'admin' where username = 'admin';
   ```
3. ກັບໄປ http://localhost:3000 → login ດ້ວຍ **ຢູເຊີ:** `admin` **ລະຫັດ:** ທີ່ຕັ້ງໄວ້
   (ຢູ່ໜ້າ login ຄີ່ແຕ່ຊື່ຢູເຊີ `admin` ບໍ່ຕ້ອງໃສ່ `@ssmi.local` — ລະບົບຕໍ່ໃຫ້ເອງ)

ຈາກນັ້ນ admin ສາມາດເຂົ້າ **ແຖບ "ຜູ້ໃຊ້"** ສ້າງພະນັກງານ (staff) ແລະ ກຳນົດແຂວງໃຫ້ແຕ່ລະຄົນໄດ້ (ຕ້ອງ deploy ຂັ້ນຕອນ 5 ກ່ອນ).

---

## 7. ຂຶ້ນ Production (ທາງເລືອກ — Vercel)

1. push ໂຄ້ດຂຶ້ນ GitHub
2. https://vercel.com → **Import** repo ນັ້ນ
3. ໃສ່ Environment Variables 2 ຕົວ (ຄືກັບ .env.local):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy** → ໄດ້ລິ້ງໃຊ້ງານຈິງ

---

## ✅ ສະຫຼຸບລຳດັບ

```
npm install
→ ສ້າງໂປຣເຈັກ Supabase (ເອົາ URL + anon key)
→ ລັນ SQL: 0001 → seed_land_prices → 0002 → 0003
→ ຕັ້ງ .env.local → npm run dev
→ deploy edge function admin-create-user
→ ສ້າງ admin ຄົນທຳອິດ (dashboard + update role) → login
```

---

## 🔧 ແກ້ບັນຫາທີ່ພົບເລື້ອຍ

| ອາການ | ສາເຫດ / ວິທີແກ້ |
|---|---|
| login ແລ້ວເດ້ງກັບ / ເຂົ້າບໍ່ໄດ້ | ຍັງບໍ່ໄດ້ລັນ `0002_auth.sql` ຫຼື ຍັງບໍ່ມີ profile → ກວດຕາຕະລາງ `profiles` |
| `Invalid login credentials` | ຢູເຊີ/ລະຫັດຜິດ ຫຼື ຜູ້ໃຊ້ຍັງບໍ່ confirm → ຕິກ Auto Confirm ຕອນສ້າງ |
| admin ສ້າງຜູ້ໃຊ້ບໍ່ໄດ້ | ຍັງບໍ່ໄດ້ deploy edge function (ຂັ້ນຕອນ 5) |
| ແນບຮູບໃບຕາດິນແລ້ວ error | ຍັງບໍ່ໄດ້ລັນ `0003_storage.sql` (bucket `title-docs`) |
| ເຫັນແຕ່ແຂວງດຽວ/ບໍ່ເຫັນແຂວງ | staff ຍັງບໍ່ໄດ້ຮັບມອບແຂວງ → admin ໄປແຖບ "ຜູ້ໃຊ້" ກຳນົດແຂວງ |
| `Missing env` / ຂຶ້ນຂາວ | `.env.local` ຍັງບໍ່ຖືກ ຫຼື ລືມ restart `npm run dev` ຫຼັງແກ້ env |

---

## 📁 ໂຄງສ້າງໄຟລ໌

```
land-loan-valuation/
├─ src/app/page.tsx          ໜ້າປະເມີນ (ພະນັກງານ)
├─ src/app/admin/page.tsx    ໜ້າຈັດການຂໍ້ມູນ (admin)
├─ src/app/login/            ໜ້າ login
├─ src/lib/                  valuation.ts (ສູດຄຳນວນ), auth.ts, supabaseClient.ts
├─ supabase/
│  ├─ 0001_init.sql          ຕາຕະລາງຫຼັກ
│  ├─ seed_land_prices.sql   ຂໍ້ມູນລາຄາ
│  ├─ 0002_auth.sql          login + RLS
│  ├─ 0003_storage.sql       bucket ຮູບ
│  └─ functions/admin-create-user/   edge function ສ້າງຜູ້ໃຊ້
├─ .env.local.example
├─ README.md                 ອະທິບາຍສູດ/ຕາຕະລາງ
├─ ADMIN.md                  ຄູ່ມືໃຊ້ງານຝັ່ງ admin
└─ INSTALL.md                ← ໄຟລ໌ນີ້
```

ລາຍລະອຽດສູດຄຳນວນ ແລະ ຕາຕະລາງ: ເບິ່ງ `README.md` · ການໃຊ້ງານ admin: ເບິ່ງ `ADMIN.md`
