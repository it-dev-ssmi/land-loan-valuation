# 🚀 ຄູ່ມື Deploy ຕົວຈິງ — ຈາກສູນ ຈົນໄດ້ລິ້ງໃຊ້ງານ 24 ຊົ່ວໂມງ

ລະບົບ = **Supabase** (ຖານຂໍ້ມູນ+login, ຢູ່ຄ່າວ) + **Vercel** (ຕົວເວັບ, ຢູ່ຄ່າວ). ທັງສອງ **ຟຣີ** ພໍເລີ່ມ.
ເຮັດ 2 ພາກນີ້ຕາມລຳດັບ. ໃຊ້ເວລາລວມ ~30–45 ນາທີ.

---

# ພາກ A — Supabase (ຖານຂໍ້ມູນຂຶ້ນຄ່າວ)

## A1. ສ້າງບັນຊີ + ໂປຣເຈັກ
1. ເຂົ້າ https://supabase.com → **Start your project** → sign up ດ້ວຍ GitHub ຫຼື email
2. ກົດ **New project**
   - **Name:** `ssmi-valuation` (ຕັ້ງຫຍັງກໍໄດ້)
   - **Database Password:** ຕັ້ງລະຫັດ **ແລ້ວຈົດໄວ້** (ຈະໃຊ້ຕອນຫຼັງ)
   - **Region:** ເລືອກ **Southeast Asia (Singapore)** (ໃກ້ລາວສຸດ = ໄວສຸດ)
   - ກົດ **Create new project** → ລໍ ~2 ນາທີ ໃຫ້ມັນສ້າງແລ້ວ

## A2. ເອົາກະແຈ 2 ຕົວ (ຈົດໄວ້)
ໄປ **Project Settings** (ຮູບເຟືອງ ↙ ຊ້າຍລຸ່ມ) → **API**:
- **Project URL** → ເຊັ່ນ `https://abcdxyz.supabase.co`
- **Project API keys → `anon` `public`** → ຄີຍາວໆ

> 📋 ວາງ 2 ຄ່ານີ້ໄວ້ບ່ອນໃດບ່ອນໜຶ່ງກ່ອນ — ຈະເອົາໄປໃສ່ Vercel ຕອນພາກ B.

## A3. ລັນ SQL (ສ້າງຕາຕະລາງ + ຂໍ້ມູນ)
ໄປ **SQL Editor** (↙ ເມນູຊ້າຍ) → **+ New query**. ເຮັດ **ເທື່ອລະໄຟລ໌ 4 ຮອບ** ຕາມລຳດັບ:

| ຮອບ | ເປີດໄຟລ໌ໃນ zip | ເຮັດແນວໃດ |
|---|---|---|
| 1 | `supabase/0001_init.sql` | ເປີດໄຟລ໌ → copy ທັງໝົດ → paste ໃສ່ SQL Editor → **Run** |
| 2 | `supabase/seed_land_prices.sql` | copy → paste → **Run** (ໄຟລ໌ໃຫຍ່ ລໍໜ້ອຍໜຶ່ງ) |
| 3 | `supabase/0002_auth.sql` | copy → paste → **Run** |
| 4 | `supabase/0003_storage.sql` | copy → paste → **Run** |

ແຕ່ລະຮອບ ຖ້າເຫັນ **"Success. No rows returned"** = ຜ່ານ. ຖ້າ error ສີແດງ → ບອກຂ້ອຍຂໍ້ຄວາມນັ້ນ.

## A4. ສ້າງ admin ຄົນທຳອິດ
1. ໄປ **Authentication → Users → Add user → Create new user**
   - **Email:** `admin@ssmi.local`
   - **Password:** ຕັ້ງລະຫັດ admin (ຈົດໄວ້)
   - ✅ ຕິກ **Auto Confirm User** (ສຳຄັນ! ບໍ່ຕິກ = login ບໍ່ໄດ້)
   - **Create user**
2. ກັບໄປ **SQL Editor** → New query → paste ອັນນີ້ → **Run**:
   ```sql
   update public.profiles set role = 'admin' where username = 'admin';
   ```
   ເຫັນ **Success** = admin ພ້ອມແລ້ວ ✓

✅ **ພາກ A ແລ້ວ.** ຕອນນີ້ຖານຂໍ້ມູນ+login ອອນໄລນ໌ແລ້ວ. ໄປພາກ B ເອົາຕົວເວັບຂຶ້ນຄ່າວ.

---

# ພາກ B — Vercel (ເອົາເວັບຂຶ້ນ → ໄດ້ລິ້ງ)

ມີ 2 ວິທີ. **ວິທີ 1 (CLI)** ງ່າຍສຸດ ບໍ່ຕ້ອງໃຊ້ GitHub — ແນະນຳ.

## 🅰 ວິທີ 1 — Vercel CLI (deploy ຈາກໂຟນເດີໂດຍກົງ)

1. ຕິດຕັ້ງ CLI (ເທື່ອດຽວ) — ເປີດ Terminal/CMD:
   ```bash
   npm i -g vercel
   ```
2. ເຂົ້າໂຟນເດີໂຄ້ດ:
   ```bash
   cd ບ່ອນທີ່ແຕກ/land-loan-valuation
   npm install
   ```
3. login (ຈະເປີດ browser ໃຫ້ຢືນຢັນ):
   ```bash
   vercel login
   ```
4. deploy:
   ```bash
   vercel
   ```
   ມັນຈະຖາມ → ຕອບແບບນີ້:
   - `Set up and deploy?` → **Y**
   - `Which scope?` → ເລືອກບັນຊີເຈົ້າ (Enter)
   - `Link to existing project?` → **N**
   - `Project name?` → Enter (ເອົາຊື່ default)
   - `In which directory is your code?` → Enter (`./`)
   - ຖ້າຖາມ settings ອື່ນ → Enter ຜ່ານໄດ້
5. **ໃສ່ກະແຈ Supabase** (2 ຄ່າຈາກ A2):
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   ```
   → paste **Project URL** → ເລືອກ **Production, Preview, Development** (ກົດ space ຕິກທັງ 3) → Enter
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   → paste **anon key** → ຕິກ 3 ອັນຄືກັນ → Enter
6. deploy ຈິງ (production):
   ```bash
   vercel --prod
   ```
   → ຈະໄດ້ລິ້ງ ເຊັ່ນ `https://land-loan-valuation.vercel.app` ✓

## 🅱 ວິທີ 2 — ຜ່ານ GitHub (ຖ້າຢາກໃຫ້ອັບເດດອັດຕະໂນມັດຕອນແກ້ໂຄ້ດ)
1. push ໂຄ້ດຂຶ້ນ GitHub repo
2. https://vercel.com → sign up → **Add New → Project → Import** repo ນັ້ນ
3. ກ່ອນກົດ Deploy → ເປີດ **Environment Variables** ໃສ່ 2 ຕົວ:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
4. **Deploy** → ໄດ້ລິ້ງ

---

# ພາກ C — Deploy Edge Function (ໃຫ້ admin ສ້າງພະນັກງານໃນແອັບ)

ຖ້າຂ້າມພາກນີ້ ແອັບໃຊ້ໄດ້ປົກກະຕິ ແຕ່ການສ້າງ user ໃນໜ້າ admin ຈະບໍ່ທຳງານ (ຕ້ອງໄປສ້າງໃນ Supabase dashboard ແທນ).

```bash
npm i -g supabase
supabase login
supabase link --project-ref <ref>        # ref ຢູ່ Settings → General → Reference ID
supabase functions deploy admin-create-user
```

---

# ✅ ລອງໃຊ້ງານ

1. ເປີດລິ້ງ `https://....vercel.app`
2. login: **ຢູເຊີ** `admin` · **ລະຫັດ** ທີ່ຕັ້ງໄວ້ (A4)
3. admin → ແຖບ **"ຜູ້ໃຊ້"** → ສ້າງພະນັກງານແຕ່ລະແຂວງ + ກຳນົດແຂວງ (ຕ້ອງເຮັດພາກ C ກ່ອນ)
4. ພະນັກງານ login ດ້ວຍ user ຕົນ → ປະເມີນ → ອອກ PDF

---

# 🔧 ຕິດບ່ອນໃດ

| ອາການ | ແກ້ |
|---|---|
| ເປີດລິ້ງແລ້ວຂາວ/error | env ຍັງບໍ່ຖືກ → Vercel → Settings → Environment Variables ກວດ 2 ຄ່າ → **Redeploy** |
| login ບໍ່ໄດ້ | ລືມຕິກ Auto Confirm, ຫຼື ຍັງບໍ່ໄດ້ລັນ update role admin (A4) |
| ສ້າງ user ໃນ admin ບໍ່ໄດ້ | ຍັງບໍ່ໄດ້ deploy edge function (ພາກ C) |
| ແນບຮູບ error | ຍັງບໍ່ໄດ້ລັນ `0003_storage.sql` (A3 ຮອບ 4) |
| ແກ້ env ແລ້ວບໍ່ປ່ຽນ | ຕ້ອງ **Redeploy** ໃໝ່ (env ບໍ່ມີຜົນກັບ build ເກົ່າ) |

> ⚠ Supabase ຟຣີ tier: ຖ້າ **ບໍ່ມີຄົນໃຊ້ 7 ວັນ** ໂປຣເຈັກຈະ pause (ກົດ resume ໃນ dashboard ຄືນໄດ້).
> ໃຊ້ຈິງປະຈຳ ຄວນ upgrade ແພັກ Supabase ($25/ເດືອນ) ແລະ Vercel ຕາມການນຳໃຊ້.
