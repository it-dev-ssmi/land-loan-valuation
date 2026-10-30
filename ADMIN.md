# ລະບົບຜູ້ໃຊ້ (login) ແລະ ການແຍກສິດຕາມແຂວງ

## ພາບລວມ
- **ແອັບດຽວ, login ບ່ອນດຽວ** (`/login`) — ຫຼັງ login ລະບົບພາໄປຕາມບົດບາດ:
  - **admin** (super admin, ຄົນດຽວ/ກຸ່ມດຽວ) → `/admin` ຄຸມ**ທຸກແຂວງ** ແລະ ທຸກການຕັ້ງຄ່າ.
  - **staff** (ພະນັກງານປະຈຳແຂວງ) → `/` ໜ້າປະເມີນ, ເຫັນ/ໃຊ້ສະເພາະ**ແຂວງຕົນ** (ແຂວງຖືກລັອກ).
- staff ເຂົ້າ `/admin` ບໍ່ໄດ້ (ຖືກພາກັບໜ້າປະເມີນ). ຄວາມປອດໄພບັງຄັບທີ່ RLS ນຳ.

## ຕິດຕັ້ງ
1. ລັນ `supabase/0001_init.sql` → `supabase/seed_land_prices.sql` → **`supabase/0002_auth.sql`**.
2. ເປີດ Email auth: Supabase → Authentication → Providers → Email (ປິດ "Confirm email" ສຳລັບ username ພາຍໃນ).

## ຢູເຊີເຮັດວຽກແນວໃດ
Supabase Auth ໃຊ້ email — ລະບົບແປງ **ຢູເຊີ → email ພາຍໃນ**: `ຢູເຊີ@ssmi.local`.
ຕົວຢ່າງ: ຢູເຊີ `lpb` → email `lpb@ssmi.local`.

## ສ້າງຜູ້ໃຊ້ໃໝ່
**ວິທີ 1 (ແນະນຳ): ສ້າງຈາກໜ້າຫຼັງບ້ານໂດຍກົງ**
admin → `/admin` → ແຖບ **ຜູ້ໃຊ້ & ສິດ** → ກາບ "ສ້າງຜູ້ໃຊ້ໃໝ່":
ໃສ່ ຢູເຊີ, ລະຫັດຜ່ານ, ຊື່, ບົດບາດ, ຕິ໊ກແຂວງ → ກົດ "ສ້າງຜູ້ໃຊ້".
> ຕ້ອງ deploy Edge Function ກ່ອນ (ເບິ່ງລຸ່ມ). ຖ້າຍັງບໍ່ທັນ deploy ຈະໃຊ້ວິທີ 2.

**ວິທີ 2 (ຜ່ານ Supabase Dashboard):**
Supabase → Authentication → **Add user**:
- Email: `<ຢູເຊີ>@ssmi.local`  (ເຊັ່ນ `lpb@ssmi.local`)
- Password: ຕາມຕ້ອງການ
- **User metadata** (JSON):
  ```json
  { "username": "lpb", "full_name": "ພະນັກງານ ຫຼວງພະບາງ", "role": "staff" }
  ```
  (role = `admin` ຫຼື `staff`)
Trigger `handle_new_user` ຈະສ້າງແຖວໃນ `profiles` ອັດຕະໂນມັດ.

## Deploy Edge Function (ສຳລັບສ້າງຜູ້ໃຊ້ຈາກໜ້າຫຼັງບ້ານ)
```
supabase functions deploy admin-create-user
```
Secrets `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` ຖືກ inject ໃຫ້ອັດຕະໂນມັດ.
Function ກວດວ່າຜູ້ເອີ້ນເປັນ admin ກ່ອນ ຈຶ່ງສ້າງຜູ້ໃຊ້ (ໃຊ້ service_role ຝັ່ງ server — ບໍ່ເປີດເຜີຍ key).

## ກຳນົດແຂວງໃຫ້ staff
ເຂົ້າ `/admin` ດ້ວຍບັນຊີ admin → ແຖບ **ຜູ້ໃຊ້ & ສິດ** → ເລືອກຜູ້ໃຊ້ → ຕິ໊ກແຂວງ → ບັນທຶກ.
(ຂຽນລົງຕາຕະລາງ `user_provinces`)

## ຕາຕະລາງທີ່ກ່ຽວຂ້ອງ
| ຕາຕະລາງ | ຄວາມໝາຍ |
|---|---|
| `profiles` | ຢູເຊີ, ຊື່, ບົດບາດ (admin/staff) |
| `user_provinces` | ແຂວງທີ່ staff ແຕ່ລະຄົນມີສິດ |

## RLS (ສະຫຼຸບ)
- `road_types`, `building_types`, `building_conditions`, `settings`, `provinces` → ແກ້ໄດ້ສະເພາະ **admin**.
- `districts`, `villages`, `land_prices` → ແກ້ໄດ້ຖ້າ **`can_access_province(ແຂວງນັ້ນ)`** (admin ຫຼື staff ທີ່ມີສິດແຂວງນັ້ນ).
- ອ່ານ (select): ຜູ້ login ທຸກຄົນອ່ານໄດ້ (ສຳລັບໜ້າປະເມີນ). ຖ້າຢາກຈຳກັດການອ່ານຕາມແຂວງນຳ ບອກໄດ້.

## ສ້າງ admin ຄົນທຳອິດ
ສ້າງ user ຕາມຂ້າງເທິງ ດ້ວຍ metadata `"role":"admin"`. ຫຼື ຕັ້ງໃນ SQL:
```sql
update public.profiles set role='admin' where username='admin';
```
