'use client';

// ========================================================================
// src/app/admin/page.tsx — ໜ້າ admin ແກ້ຂໍ້ມູນທັງໝົດ
// ແກ້ໄດ້: ລາຄາດິນ (ຕາມບ້ານ), % ປະເພດທາງ, ປະເພດສິ່ງປຸກສ້າງ, ສະພາບ, ວົງເງິນສູງສຸດ
// ໝາຍເຫດ: ການຂຽນຕ້ອງ login ແລະ RLS ອະນຸຍາດ (ເບິ່ງ ADMIN.md)
// ========================================================================

import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Calculator, ImageIcon, Loader2, Plus, Save, Search, Trash2, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { formatLAK, groupDigits, onlyDigits } from '@/lib/valuation';
import { getMe, type Me } from '@/lib/auth';
import { signedDocUrls } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { AppHeader, PageLoading } from '@/components/app-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Tab = 'land' | 'roads' | 'buildings' | 'conditions' | 'fees' | 'dash' | 'history' | 'settings' | 'users';
const ALL_TABS: [Tab, string][] = [
  ['land', 'ລາຄາດິນ'], ['roads', 'ປະເພດທາງ & %'],
  ['buildings', 'ສິ່ງປຸກສ້າງ'], ['conditions', 'ອາຍຸ/ຄ່າຫຼຸ້ຍຫ້ຽນ'],
  ['fees', 'ຄ່າທຳນຽມ'], ['dash', 'Dashboard'], ['history', 'ປະຫວັດການປະເມີນ'], ['settings', 'ຕັ້ງຄ່າ'], ['users', 'ຜູ້ໃຊ້ & ສິດ'],
];

export default function Admin() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('land');
  const [logoUrl, setLogoUrl] = useState('');
  const [instName, setInstName] = useState('');

  useEffect(() => {
    getMe().then(m => {
      if (!m) { router.replace('/login'); return; }
      if (!m.isAdmin) { router.replace('/staff'); return; } // admin ສະເພາະ super admin
      setMe(m); setLoading(false);
    });
    supabase.from('settings').select('key,value_text').in('key', ['logo_url', 'inst_name'])
      .then(({ data }) => {
        const t = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value_text]));
        setLogoUrl(t.logo_url ?? ''); setInstName(t.inst_name ?? '');
      });
  }, [router]);

  if (loading || !me) return <PageLoading />;

  return (
    <>
      <AppHeader me={me} logoUrl={logoUrl} instName={instName} title="ແກ້ຂໍ້ມູນລະບົບ"
        nav={{ href: '/staff', label: 'ໜ້າປະເມີນ', icon: <Calculator /> }} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs value={tab} onValueChange={v => setTab(v as Tab)} className="gap-6">
          <div className="-mx-4 overflow-x-auto px-4">
            <TabsList className="w-max">
              {ALL_TABS.map(([t, label]) => <TabsTrigger key={t} value={t}>{label}</TabsTrigger>)}
            </TabsList>
          </div>
          <TabsContent value="land"><LandPrices me={me} /></TabsContent>
          <TabsContent value="roads"><RoadTypes /></TabsContent>
          <TabsContent value="buildings"><BuildingTypes /></TabsContent>
          <TabsContent value="conditions"><Conditions /></TabsContent>
          <TabsContent value="fees"><Fees /></TabsContent>
          <TabsContent value="dash"><Dashboard /></TabsContent>
          <TabsContent value="history"><History /></TabsContent>
          <TabsContent value="settings"><Settings /></TabsContent>
          <TabsContent value="users"><Users /></TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function useToast() {
  return {
    ok: (m = 'ບັນທຶກແລ້ວ') => { toast.success(m); },
    err: (e: string) => { toast.error('ຜິດພາດ: ' + e); },
  };
}

// ປ້າຍ + ຊ່ອງປ້ອນ
function Field({ label, htmlFor, children, className }: { label: string; htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={htmlFor} className="text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

// ---------- ລາຄາດິນ (ແຂວງ → ເມືອງ → ບ້ານ → ປະເພດທາງ) ----------
interface Road { id: string; name_lo: string; sort_order: number; }
function LandPrices({ me }: { me: Me }) {
  const t = useToast();
  const [provinces, setProvinces] = useState<{ id: string; name_lo: string }[]>([]);
  const [provinceId, setProvinceId] = useState('');
  const [districts, setDistricts] = useState<{ id: string; name_lo: string }[]>([]);
  const [villages, setVillages] = useState<{ id: string; name_lo: string }[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [districtId, setDistrictId] = useState('');
  const [villageId, setVillageId] = useState('');
  const [vals, setVals] = useState<Record<string, string>>({}); // road_type_id -> price string

  useEffect(() => {
    // ແຂວງ: admin ເຫັນທຸກແຂວງ; staff ເຫັນສະເພາະແຂວງທີ່ມີສິດ
    supabase.from('provinces').select('id,name_lo').order('name_lo').then(({ data }) => {
      const list = (data ?? []).filter((p: any) => me.isAdmin || me.provinceIds.includes(p.id));
      setProvinces(list);
    });
    supabase.from('road_types').select('id,name_lo,sort_order').order('sort_order').then(({ data }) => setRoads(data ?? []));
  }, [me]);
  useEffect(() => {
    setDistrictId(''); setVillageId(''); setDistricts([]); setVillages([]);
    if (provinceId) supabase.from('districts').select('id,name_lo').eq('province_id', provinceId).order('name_lo').then(({ data }) => setDistricts(data ?? []));
  }, [provinceId]);
  useEffect(() => {
    setVillageId(''); setVillages([]);
    if (districtId) supabase.from('villages').select('id,name_lo').eq('district_id', districtId).order('seq').then(({ data }) => setVillages(data ?? []));
  }, [districtId]);
  useEffect(() => {
    setVals({});
    if (!villageId) return;
    supabase.from('land_prices').select('road_type_id,price_per_m2').eq('village_id', villageId).then(({ data }) => {
      const m: Record<string, string> = {};
      (data ?? []).forEach((r: any) => { m[r.road_type_id] = String(r.price_per_m2); });
      setVals(m);
    });
  }, [villageId]);

  async function saveAll() {
    for (const r of roads) {
      const raw = (vals[r.id] ?? '').replace(/,/g, '').trim();
      if (raw === '') {
        await supabase.from('land_prices').delete().eq('village_id', villageId).eq('road_type_id', r.id);
      } else {
        const { error } = await supabase.from('land_prices')
          .upsert({ village_id: villageId, road_type_id: r.id, price_per_m2: Number(raw) },
            { onConflict: 'village_id,road_type_id' });
        if (error) { t.err(error.message); return; }
      }
    }
    t.ok();
  }

  async function addVillage() {
    const name = prompt('ຊື່ບ້ານໃໝ່:');
    if (!name || !districtId) return;
    const { data, error } = await supabase.from('villages')
      .insert({ district_id: districtId, name_lo: name }).select('id,name_lo').single();
    if (error) return t.err(error.message);
    setVillages(v => [...v, data!]); setVillageId(data!.id);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>ເລືອກບ້ານ</CardTitle>
          <CardDescription>ແຂວງ → ເມືອງ → ບ້ານ</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="ແຂວງ">
            <NativeSelect className="w-full" value={provinceId} onChange={e => setProvinceId(e.target.value)}>
              <NativeSelectOption value="">— ເລືອກແຂວງ —</NativeSelectOption>
              {provinces.map(p => <NativeSelectOption key={p.id} value={p.id}>{p.name_lo}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
          <Field label="ເມືອງ">
            <NativeSelect className="w-full" value={districtId} onChange={e => setDistrictId(e.target.value)} disabled={!provinceId}>
              <NativeSelectOption value="">— ເລືອກເມືອງ —</NativeSelectOption>
              {districts.map(d => <NativeSelectOption key={d.id} value={d.id}>{d.name_lo}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
          <Field label="ບ້ານ">
            <div className="flex gap-2">
              <NativeSelect className="w-full" value={villageId} onChange={e => setVillageId(e.target.value)} disabled={!districtId}>
                <NativeSelectOption value="">— ເລືອກບ້ານ —</NativeSelectOption>
                {villages.map(v => <NativeSelectOption key={v.id} value={v.id}>{v.name_lo}</NativeSelectOption>)}
              </NativeSelect>
              {districtId && <Button variant="outline" onClick={addVillage}><Plus />ເພີ່ມບ້ານ</Button>}
            </div>
          </Field>
          {!provinces.length && <p className="text-sm text-muted-foreground">ທ່ານຍັງບໍ່ມີສິດໃນແຂວງໃດ — ຕິດຕໍ່ແອັດມິນ</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ລາຄາດິນ (ກີບ/ຕ.ມ.)</CardTitle>
          <CardDescription>ປ່ອຍວ່າງ = ບໍ່ມີທາງປະເພດນັ້ນ</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {!villageId && <p className="text-sm text-muted-foreground">ເລືອກບ້ານກ່ອນ</p>}
          {villageId && roads.map(r => (
            <div key={r.id} className="grid grid-cols-[1fr_180px] items-center gap-3">
              <Label htmlFor={`lp-${r.id}`}>{r.name_lo}</Label>
              <Input id={`lp-${r.id}`} inputMode="numeric" className="text-right tabular-nums" value={groupDigits(vals[r.id] ?? '')}
                onChange={e => setVals(s => ({ ...s, [r.id]: onlyDigits(e.target.value) }))} placeholder="—" />
            </div>
          ))}
        </CardContent>
        {villageId && (
          <CardFooter><Button onClick={saveAll}><Save />ບັນທຶກລາຄາບ້ານນີ້</Button></CardFooter>
        )}
      </Card>
    </div>
  );
}

// ---------- ປະເພດທາງ & % ----------
function RoadTypes() {
  const t = useToast();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { supabase.from('road_types').select('*').order('sort_order').then(({ data }) => setRows(data ?? [])); }, []);
  async function save(id: string, ltv: number) {
    const { error } = await supabase.from('road_types').update({ ltv_pct: ltv }).eq('id', id);
    error ? t.err(error.message) : t.ok();
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>ປະເພດທາງ</CardTitle>
        <CardDescription>% ປ່ອຍກູ້ຂອງມູນຄ່າດິນ ຕາມປະເພດທາງ</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow><TableHead>ປະເພດທາງ</TableHead><TableHead className="w-36">% ປ່ອຍກູ້</TableHead><TableHead className="w-28" /></TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name_lo}</TableCell>
                <TableCell>
                  <Input type="number" min="0" max="100" value={r.ltv_pct}
                    onChange={e => setRows(s => s.map((x, j) => j === i ? { ...x, ltv_pct: e.target.value } : x))} />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => save(r.id, Number(r.ltv_pct))}><Save />ບັນທຶກ</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ---------- ປະເພດສິ່ງປຸກສ້າງ ----------
function BuildingTypes() {
  const t = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const load = () => supabase.from('building_types').select('*').order('price_per_m2').then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);
  async function save(r: any) {
    const { error } = await supabase.from('building_types')
      .update({ name_lo: r.name_lo, price_per_m2: Number(r.price_per_m2), ltv_pct: Number(r.ltv_pct), is_active: r.is_active }).eq('id', r.id);
    error ? t.err(error.message) : t.ok();
  }
  async function add() {
    const { error } = await supabase.from('building_types').insert({ name_lo: 'ປະເພດໃໝ່', price_per_m2: 0, ltv_pct: 50 });
    if (error) return t.err(error.message); load();
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>ປະເພດສິ່ງປຸກສ້າງ</CardTitle>
        <CardDescription>ມູນຄ່າກໍ່ສ້າງ ກີບ/ຕ.ມ. ແລະ % ປ່ອຍກູ້</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ຊື່ປະເພດ</TableHead><TableHead className="w-44">ກີບ/ຕ.ມ.</TableHead>
              <TableHead className="w-28">% ປ່ອຍກູ້</TableHead><TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell><Input value={r.name_lo} onChange={e => setRows(s => s.map((x, j) => j === i ? { ...x, name_lo: e.target.value } : x))} /></TableCell>
                <TableCell><Input inputMode="numeric" className="text-right tabular-nums" value={groupDigits(r.price_per_m2)} onChange={e => setRows(s => s.map((x, j) => j === i ? { ...x, price_per_m2: onlyDigits(e.target.value) } : x))} /></TableCell>
                <TableCell><Input type="number" value={r.ltv_pct} onChange={e => setRows(s => s.map((x, j) => j === i ? { ...x, ltv_pct: e.target.value } : x))} /></TableCell>
                <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => save(rows[i])}><Save />ບັນທຶກ</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter><Button variant="outline" onClick={add}><Plus />ເພີ່ມປະເພດ</Button></CardFooter>
    </Card>
  );
}

// ---------- ສະພາບ/ຄ່າຫຼຸ້ຍຫ້ຽນ ----------
function Conditions() {
  const t = useToast();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { supabase.from('building_conditions').select('*').order('sort_order').then(({ data }) => setRows(data ?? [])); }, []);
  async function save(r: any) {
    const { error } = await supabase.from('building_conditions').update({ name_lo: r.name_lo, factor_pct: Number(r.factor_pct) }).eq('id', r.id);
    error ? t.err(error.message) : t.ok();
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>ອາຍຸ / ຄ່າຫຼຸ້ຍຫ້ຽນ</CardTitle>
        <CardDescription>ຕົວຄູນຄ່າຫຼຸ້ຍຫ້ຽນ % (100 = ໃໝ່)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow><TableHead>ອາຍຸ / ສະພາບ</TableHead><TableHead className="w-32">ຕົວຄູນ %</TableHead><TableHead className="w-28" /></TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell><Input value={r.name_lo} onChange={e => setRows(s => s.map((x, j) => j === i ? { ...x, name_lo: e.target.value } : x))} /></TableCell>
                <TableCell><Input type="number" min="0" max="100" value={r.factor_pct} onChange={e => setRows(s => s.map((x, j) => j === i ? { ...x, factor_pct: e.target.value } : x))} /></TableCell>
                <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => save(rows[i])}><Save />ບັນທຶກ</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ---------- ຕັ້ງຄ່າ (ວົງເງິນສູງສຸດ) ----------
function Settings() {
  const t = useToast();
  const [val, setVal] = useState('');
  const [mLand, setMLand] = useState('2');
  const [mBld, setMBld] = useState('2');
  const [logo, setLogo] = useState('');
  const [name, setName] = useState('');
  useEffect(() => {
    supabase.from('settings').select('key,value_num,value_text')
      .in('key', ['max_loan', 'extra_mult_land', 'extra_mult_building', 'logo_url', 'inst_name'])
      .then(({ data }) => {
        const m = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value_num]));
        const tx = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value_text]));
        setVal(m.max_loan != null ? String(m.max_loan) : '');
        setMLand(m.extra_mult_land != null ? String(m.extra_mult_land) : '2');
        setMBld(m.extra_mult_building != null ? String(m.extra_mult_building) : '2');
        setLogo(tx.logo_url ?? ''); setName(tx.inst_name ?? '');
      });
  }, []);
  function onLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => setLogo(String(rd.result));
    rd.readAsDataURL(f);
  }
  async function saveBrand() {
    const { error } = await supabase.from('settings').upsert([
      { key: 'logo_url', value_text: logo || null },
      { key: 'inst_name', value_text: name || null },
    ]);
    error ? t.err(error.message) : t.ok('ບັນທຶກໂລໂກ້ແລ້ວ');
  }
  async function save() {
    const v = val.replace(/,/g, '').trim();
    const { error } = await supabase.from('settings').upsert([
      { key: 'max_loan', value_num: v === '' ? null : Number(v) },
      { key: 'extra_mult_land', value_num: Number(mLand) || 1 },
      { key: 'extra_mult_building', value_num: Number(mBld) || 1 },
    ]);
    error ? t.err(error.message) : t.ok();
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>ໂລໂກ້ ແລະ ຊື່ສະຖາບັນ</CardTitle>
          <CardDescription>ສະແດງເທິງຫົວໜ້າປະເມີນ ແລະ ຫຼັງບ້ານ</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="ຊື່ສະຖາບັນ" htmlFor="instName">
            <Input id="instName" value={name} onChange={e => setName(e.target.value)} placeholder="ຊື່ສະຖາບັນ" />
          </Field>
          <Field label="ຮູບໂລໂກ້ (PNG/JPG)" htmlFor="logoFile">
            <Input id="logoFile" type="file" accept="image/*" onChange={onLogoFile} />
          </Field>
          {logo && <img src={logo} alt="" className="h-16 w-fit max-w-52 rounded-lg border bg-muted/40 object-contain p-1" />}
        </CardContent>
        <CardFooter className="gap-2">
          <Button onClick={saveBrand}><Save />ບັນທຶກໂລໂກ້</Button>
          {logo && <Button variant="outline" onClick={() => setLogo('')}><Trash2 />ລຶບ</Button>}
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>ຕັ້ງຄ່າລະບົບ</CardTitle>
          <CardDescription>ວົງເງິນສູງສຸດ ແລະ ຕົວຄູນພິເສດ</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="ວົງເງິນປ່ອຍກູ້ສູງສຸດ/ລາຍການ (ວ່າງ = ບໍ່ຈຳກັດ)" htmlFor="maxLoan">
            <Input id="maxLoan" inputMode="numeric" className="tabular-nums" value={groupDigits(val)} onChange={e => setVal(onlyDigits(e.target.value))} placeholder="ບໍ່ຈຳກັດ" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ຕົວຄູນພິເສດ — ດິນ (×)" htmlFor="mLand">
              <Input id="mLand" type="number" min="1" step="0.1" value={mLand} onChange={e => setMLand(e.target.value)} />
            </Field>
            <Field label="ຕົວຄູນພິເສດ — ສິ່ງປຸກສ້າງ (×)" htmlFor="mBld">
              <Input id="mBld" type="number" min="1" step="0.1" value={mBld} onChange={e => setMBld(e.target.value)} />
            </Field>
          </div>
        </CardContent>
        <CardFooter><Button onClick={save}><Save />ບັນທຶກ</Button></CardFooter>
      </Card>
    </div>
  );
}

// ---------- ຄ່າທຳນຽມ (ມາດຕາ 6) ----------
const FEE_KEYS = [
  ['fee_service_threshold', 'ວົງເງິນຂັ້ນແບ່ງ % ຄ່າບໍລິການ'],
  ['fee_service_rate_low', '% ຄ່າບໍລິການ ວົງເງິນ ≤ ຂັ້ນແບ່ງ'],
  ['fee_service_rate_high', '% ຄ່າບໍລິການ ວົງເງິນ > ຂັ້ນແບ່ງ'],
  ['fee_assess_in_town', 'ຄ່າລົງປະເມີນ ໃນເມືອງ'],
  ['fee_assess_tier1', 'ຄ່າລົງປະເມີນ ຕ່າງເມືອງ ≤ ຂັ້ນ 1'],
  ['fee_assess_tier2', 'ຄ່າລົງປະເມີນ ຂັ້ນ 1–ຂັ້ນ 2'],
  ['fee_assess_tier3', 'ຄ່າລົງປະເມີນ > ຂັ້ນ 2'],
  ['fee_assess_dist1', 'ຂັ້ນໄລຍະທາງ 1 (km)'],
  ['fee_assess_dist2', 'ຂັ້ນໄລຍະທາງ 2 (km)'],
] as const;
function Fees() {
  const t = useToast();
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => {
    supabase.from('settings').select('key,value_num').in('key', FEE_KEYS.map(k => k[0]))
      .then(({ data }) => {
        const m: Record<string, string> = {};
        (data ?? []).forEach((r: any) => { m[r.key] = r.value_num != null ? String(r.value_num) : ''; });
        setVals(m);
      });
  }, []);
  async function save() {
    const rows = FEE_KEYS.map(([k]) => ({ key: k, value_num: Number(vals[k]) || 0 }));
    const { error } = await supabase.from('settings').upsert(rows);
    error ? t.err(error.message) : t.ok();
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>ຄ່າທຳນຽມ</CardTitle>
        <CardDescription>ຄ່າທຳນຽມບໍລິການ (6.1) ແລະ ຄ່າລົງປະເມີນຫຼັກຊັບ (6.2) — ກີບ ແລະ %</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEE_KEYS.map(([k, label]) => {
          const money = k.startsWith('fee_assess') && !k.includes('dist') || k === 'fee_service_threshold';
          return (
            <Field key={k} label={label} htmlFor={k}>
              {money
                ? <Input id={k} inputMode="numeric" className="tabular-nums" value={groupDigits(vals[k] ?? '')}
                    onChange={e => setVals(s => ({ ...s, [k]: onlyDigits(e.target.value) }))} />
                : <Input id={k} type="number" min="0" step="0.1" value={vals[k] ?? ''}
                    onChange={e => setVals(s => ({ ...s, [k]: e.target.value }))} />}
            </Field>
          );
        })}
      </CardContent>
      <CardFooter><Button onClick={save}><Save />ບັນທຶກ</Button></CardFooter>
    </Card>
  );
}

// ---------- Dashboard ສະຫຼຸບ ----------
interface DRec { created_by: string; total_loan: number; total_fee: number; villages: { districts: { provinces: { name_lo: string } } } | null; }
function Dashboard() {
  const [recs, setRecs] = useState<DRec[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('profiles').select('id,username,full_name').then(({ data }) => {
      const m: Record<string, string> = {};
      (data ?? []).forEach((p: any) => { m[p.id] = p.full_name || p.username; });
      setNames(m);
    });
    supabase.from('valuations')
      .select('created_by,total_loan,total_fee,villages(districts(provinces(name_lo)))')
      .limit(2000)
      .then(({ data }) => { setRecs((data as any) ?? []); setLoading(false); });
  }, []);

  const n = recs.length;
  const sumLoan = recs.reduce((a, r) => a + (Number(r.total_loan) || 0), 0);
  const sumFee = recs.reduce((a, r) => a + (Number(r.total_fee) || 0), 0);
  const agg = (keyFn: (r: DRec) => string) => {
    const m: Record<string, { n: number; s: number }> = {};
    recs.forEach(r => { const k = keyFn(r) || '-'; (m[k] = m[k] || { n: 0, s: 0 }); m[k].n++; m[k].s += Number(r.total_loan) || 0; });
    return Object.entries(m).sort((a, b) => b[1].s - a[1].s);
  };
  const byStaff = agg(r => names[r.created_by] ?? r.created_by?.slice(0, 8));
  const byProv = agg(r => r.villages?.districts?.provinces?.name_lo ?? '-');

  const Bars = ({ data }: { data: [string, { n: number; s: number }][] }) => {
    const mx = Math.max(1, ...data.map(x => x[1].s));
    if (!data.length) return <p className="text-sm text-muted-foreground">ຍັງບໍ່ມີຂໍ້ມູນ</p>;
    return <div className="grid gap-4">{data.map(([k, v]) => (
      <div key={k} className="grid gap-1.5">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-medium">{k} <span className="text-muted-foreground">({v.n})</span></span>
          <span className="tabular-nums font-semibold">{formatLAK(v.s)}</span>
        </div>
        <Progress value={Math.round(v.s / mx * 100)} />
      </div>
    ))}</div>;
  };

  const Stat = ({ label, value }: { label: string; value: string }) => (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums text-primary">{loading ? '…' : value}</CardTitle>
      </CardHeader>
    </Card>
  );

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="ຈຳນວນການປະເມີນ" value={`${n} ລາຍການ`} />
        <Stat label="ວົງເງິນລວມ" value={formatLAK(sumLoan)} />
        <Stat label="ຄ່າທຳນຽມລວມ" value={formatLAK(sumFee)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>ຕາມພະນັກງານຜູ້ປະເມີນ</CardTitle></CardHeader><CardContent><Bars data={byStaff} /></CardContent></Card>
        <Card><CardHeader><CardTitle>ຕາມແຂວງ</CardTitle></CardHeader><CardContent><Bars data={byProv} /></CardContent></Card>
      </div>
    </div>
  );
}

// ---------- ປະຫວັດການປະເມີນ (admin: ຄົ້ນຫາ ຜູ້ໃດປະເມີນລູກຄ້າໃດ) ----------
interface Rec {
  id: string; created_at: string; created_by: string;
  borrower_first_name: string | null; borrower_last_name: string | null;
  total_loan: number; total_fee: number; title_doc_urls: string[] | null;
  villages: { name_lo: string; districts: { name_lo: string; provinces: { id: string; name_lo: string } } } | null;
}
function History() {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [names, setNames] = useState<Record<string, string>>({}); // uid -> username/full_name
  const [provinces, setProvinces] = useState<{ id: string; name_lo: string }[]>([]);
  const [q, setQ] = useState('');
  const [byUid, setByUid] = useState('');
  const [provId, setProvId] = useState('');
  const [loading, setLoading] = useState(true);
  const [docsOf, setDocsOf] = useState('');          // id ຂອງລາຍການທີ່ເປີດຮູບຢູ່
  const [docUrls, setDocUrls] = useState<string[]>([]);

  // ເປີດ/ປິດ ຮູບໃບຕາດິນ (signed URL ຈາກ bucket private)
  async function toggleDocs(r: Rec) {
    if (docsOf === r.id) { setDocsOf(''); return; }
    setDocsOf(r.id); setDocUrls([]);
    try { setDocUrls(await signedDocUrls(r.title_doc_urls ?? [])); }
    catch (e: any) { toast.error('ເປີດຮູບບໍ່ໄດ້: ' + e.message); }
  }

  useEffect(() => {
    supabase.from('profiles').select('id,username,full_name')
      .then(({ data }) => {
        const m: Record<string, string> = {};
        (data ?? []).forEach((p: any) => { m[p.id] = p.full_name ? `${p.username} — ${p.full_name}` : p.username; });
        setNames(m);
      });
    supabase.from('provinces').select('id,name_lo').order('name_lo').then(({ data }) => setProvinces(data ?? []));
    supabase.from('valuations')
      .select('id,created_at,created_by,borrower_first_name,borrower_last_name,total_loan,total_fee,title_doc_urls,villages(name_lo,districts(name_lo,provinces(id,name_lo)))')
      .order('created_at', { ascending: false }).limit(500)
      .then(({ data }) => { setRecs((data as any) ?? []); setLoading(false); });
  }, []);

  const filtered = recs.filter(r => {
    const borrower = `${r.borrower_first_name ?? ''} ${r.borrower_last_name ?? ''}`.trim().toLowerCase();
    if (q.trim() && !borrower.includes(q.trim().toLowerCase())) return false;
    if (byUid && r.created_by !== byUid) return false;
    if (provId && r.villages?.districts?.provinces?.id !== provId) return false;
    return true;
  });
  const staffList = Array.from(new Set(recs.map(r => r.created_by))).filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ຄົ້ນຫາປະຫວັດການປະເມີນ</CardTitle>
        <CardDescription>ຄົ້ນຕາມ ຊື່ລູກຄ້າ / ພະນັກງານຜູ້ປະເມີນ / ແຂວງ</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="ຊື່ລູກຄ້າ" htmlFor="q">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="q" className="pl-8" value={q} onChange={e => setQ(e.target.value)} placeholder="ພິມຊື່ລູກຄ້າ…" />
            </div>
          </Field>
          <Field label="ພະນັກງານຜູ້ປະເມີນ">
            <NativeSelect className="w-full" value={byUid} onChange={e => setByUid(e.target.value)}>
              <NativeSelectOption value="">— ທັງໝົດ —</NativeSelectOption>
              {staffList.map(uid => <NativeSelectOption key={uid} value={uid}>{names[uid] ?? uid.slice(0, 8)}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
          <Field label="ແຂວງ">
            <NativeSelect className="w-full" value={provId} onChange={e => setProvId(e.target.value)}>
              <NativeSelectOption value="">— ທັງໝົດ —</NativeSelectOption>
              {provinces.map(p => <NativeSelectOption key={p.id} value={p.id}>{p.name_lo}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
        </div>
        <p className="text-sm text-muted-foreground">{loading ? 'ກຳລັງໂຫຼດ…' : `ພົບ ${filtered.length} ລາຍການ`}</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ລູກຄ້າ</TableHead><TableHead>ທີ່ຕັ້ງ</TableHead><TableHead>ຜູ້ປະເມີນ / ວັນທີ</TableHead>
              <TableHead className="text-right">ວົງເງິນ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(r => (
              <Fragment key={r.id}>
              <TableRow>
                <TableCell className="font-medium">
                  {`${r.borrower_first_name ?? ''} ${r.borrower_last_name ?? ''}`.trim() || '(ບໍ່ມີຊື່)'}
                  {!!r.title_doc_urls?.length && (
                    <Button variant="ghost" size="xs" className="ml-1 text-primary" onClick={() => toggleDocs(r)}>
                      <ImageIcon />ຮູບ ({r.title_doc_urls.length})
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {r.villages?.districts?.provinces?.name_lo} · {r.villages?.districts?.name_lo} · {r.villages?.name_lo}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {names[r.created_by] ?? r.created_by?.slice(0, 8)}<br />
                  <span className="text-xs">{new Date(r.created_at).toLocaleString('lo-LA')}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-semibold tabular-nums text-primary">{formatLAK(r.total_loan)}</div>
                  <div className="text-xs text-muted-foreground tabular-nums">ຄ່າທຳນຽມ {formatLAK(r.total_fee)}</div>
                </TableCell>
              </TableRow>
              {docsOf === r.id && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4}>
                    {!docUrls.length
                      ? <span className="text-sm text-muted-foreground">ກຳລັງໂຫຼດຮູບ…</span>
                      : <div className="flex flex-wrap gap-3">
                          {docUrls.map((u, i) => (
                            <a key={i} href={u} target="_blank" rel="noreferrer">
                              <img src={u} alt="" className="h-28 w-auto rounded-lg border object-cover hover:opacity-90" />
                            </a>
                          ))}
                        </div>}
                  </TableCell>
                </TableRow>
              )}
              </Fragment>
            ))}
            {!loading && !filtered.length && (
              <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">ບໍ່ພົບລາຍການ</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ---------- ຜູ້ໃຊ້ & ສິດ (admin) ----------
// ກຳນົດວ່າ staff ແຕ່ລະຄົນເຫັນ/ແກ້ໄດ້ແຂວງໃດແດ່
interface Profile { id: string; username: string; full_name: string; role: string; }
function ProvinceChecks({ provinces, value, onChange }: {
  provinces: { id: string; name_lo: string }[];
  value: Record<string, boolean>;
  onChange: (id: string, on: boolean) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {provinces.map(p => (
        <Label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 font-normal hover:bg-muted/50">
          <Checkbox checked={!!value[p.id]} onCheckedChange={v => onChange(p.id, v === true)} />
          {p.name_lo}
        </Label>
      ))}
    </div>
  );
}

function Users() {
  const t = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [provinces, setProvinces] = useState<{ id: string; name_lo: string }[]>([]);
  const [userId, setUserId] = useState('');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [reload, setReload] = useState(0);
  // ---- ຟອມສ້າງຜູ້ໃຊ້ໃໝ່ ----
  const [nUser, setNUser] = useState('');
  const [nPass, setNPass] = useState('');
  const [nName, setNName] = useState('');
  const [nRole, setNRole] = useState<'staff' | 'admin'>('staff');
  const [nProv, setNProv] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    supabase.from('profiles').select('id,username,full_name,role').order('username')
      .then(({ data }) => setProfiles(data ?? []));
    supabase.from('provinces').select('id,name_lo').order('name_lo')
      .then(({ data }) => setProvinces(data ?? []));
  }, [reload]);
  useEffect(() => {
    setChecked({});
    if (!userId) return;
    supabase.from('user_provinces').select('province_id').eq('user_id', userId).then(({ data }) => {
      const m: Record<string, boolean> = {};
      (data ?? []).forEach((r: any) => { m[r.province_id] = true; });
      setChecked(m);
    });
  }, [userId]);

  async function save() {
    if (!userId) return;
    await supabase.from('user_provinces').delete().eq('user_id', userId);
    const rows = provinces.filter(p => checked[p.id]).map(p => ({ user_id: userId, province_id: p.id }));
    if (rows.length) {
      const { error } = await supabase.from('user_provinces').insert(rows);
      if (error) { t.err(error.message); return; }
    }
    t.ok();
  }

  // ສ້າງຜູ້ໃຊ້ໃໝ່ ຜ່ານ Edge Function (admin-create-user)
  async function createUser() {
    if (!nUser.trim() || !nPass) { toast.error('ຕ້ອງໃສ່ ຢູເຊີ ແລະ ລະຫັດຜ່ານ'); return; }
    setCreating(true);
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    try {
      const res = await fetch(`${base}/functions/v1/admin-create-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          username: nUser.trim(), password: nPass, full_name: nName, role: nRole,
          province_ids: nRole === 'staff' ? provinces.filter(p => nProv[p.id]).map(p => p.id) : [],
        }),
      });
      const out = await res.json();
      if (!res.ok) { toast.error('ຜິດພາດ: ' + (out.error ?? res.status)); setCreating(false); return; }
      toast.success(`ສ້າງສຳເລັດ: ${nUser} (${out.email})`);
      setNUser(''); setNPass(''); setNName(''); setNProv({});
      setReload(r => r + 1);
    } catch (e) {
      toast.error('ເອີ້ນ Edge Function ບໍ່ໄດ້ — ຍັງບໍ່ທັນ deploy? (ເບິ່ງ ADMIN.md)');
    }
    setCreating(false);
  }

  const selected = profiles.find(p => p.id === userId);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>ສ້າງຜູ້ໃຊ້ໃໝ່</CardTitle>
          <CardDescription>ຢູເຊີຈະຖືກໃຊ້ login (ບໍ່ຕ້ອງໃສ່ @)</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ຢູເຊີ" htmlFor="nUser"><Input id="nUser" value={nUser} onChange={e => setNUser(e.target.value)} placeholder="ເຊັ່ນ lpb" /></Field>
            <Field label="ລະຫັດຜ່ານ" htmlFor="nPass"><Input id="nPass" value={nPass} onChange={e => setNPass(e.target.value)} placeholder="ລະຫັດຜ່ານ" /></Field>
            <Field label="ຊື່-ນາມສະກຸນ" htmlFor="nName"><Input id="nName" value={nName} onChange={e => setNName(e.target.value)} placeholder="ຊື່ພະນັກງານ" /></Field>
            <Field label="ບົດບາດ">
              <NativeSelect className="w-full" value={nRole} onChange={e => setNRole(e.target.value as any)}>
                <NativeSelectOption value="staff">ພະນັກງານແຂວງ (staff)</NativeSelectOption>
                <NativeSelectOption value="admin">ແອັດມິນ (ທຸກແຂວງ)</NativeSelectOption>
              </NativeSelect>
            </Field>
          </div>
          {nRole === 'staff' && (
            <div className="grid gap-2">
              <Label className="text-muted-foreground">ແຂວງທີ່ຮັບຜິດຊອບ</Label>
              <ProvinceChecks provinces={provinces} value={nProv} onChange={(id, on) => setNProv(s => ({ ...s, [id]: on }))} />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={createUser} disabled={creating}>
            {creating ? <Loader2 className="animate-spin" /> : <UserPlus />}
            {creating ? 'ກຳລັງສ້າງ…' : 'ສ້າງຜູ້ໃຊ້'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ແກ້ສິດແຂວງ ຜູ້ໃຊ້ທີ່ມີຢູ່</CardTitle>
          <CardDescription>ກຳນົດວ່າ staff ແຕ່ລະຄົນເຫັນ ແລະ ແກ້ໄດ້ແຂວງໃດ</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="ເລືອກຜູ້ໃຊ້">
            <NativeSelect className="w-full" value={userId} onChange={e => setUserId(e.target.value)}>
              <NativeSelectOption value="">— ເລືອກຜູ້ໃຊ້ —</NativeSelectOption>
              {profiles.map(p => (
                <NativeSelectOption key={p.id} value={p.id}>{p.username} — {p.full_name} ({p.role})</NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          {selected && selected.role === 'admin' && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge>ແອັດມິນ</Badge> ເຫັນ/ແກ້ໄດ້ທຸກແຂວງຢູ່ແລ້ວ
            </p>
          )}
          {selected && selected.role !== 'admin' && (
            <ProvinceChecks provinces={provinces} value={checked} onChange={(id, on) => setChecked(s => ({ ...s, [id]: on }))} />
          )}
        </CardContent>
        {selected && selected.role !== 'admin' && (
          <CardFooter><Button onClick={save}><Save />ບັນທຶກສິດ</Button></CardFooter>
        )}
      </Card>
    </div>
  );
}
