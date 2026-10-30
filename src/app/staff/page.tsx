'use client';

// ========================================================================
// src/app/staff/page.tsx — ປະເມີນທີ່ດິນ → ວົງເງິນປ່ອຍກູ້ (staff + admin ເຂົ້າໄດ້)
// cascade: ແຂວງ → ເມືອງ → ບ້ານ → ປະເພດທາງ ; + ສິ່ງປຸກສ້າງ + ສະພາບ ; ດຶງທຸກຄ່າຈາກ Supabase
// ========================================================================

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Building2, FileText, ImagePlus, Loader2, MapPin, Printer, Receipt, Settings2, User, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { calculateValuation, calculateFees, formatLAK, groupDigits, onlyDigits, DEFAULT_FEE_CONFIG, type BuildingType, type FeeConfig } from '@/lib/valuation';
import { getMe, type Me } from '@/lib/auth';
import { DOC_MAX_BYTES, uploadDocs } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { AppHeader, PageLoading } from '@/components/app-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Separator } from '@/components/ui/separator';

interface Row { id: string; name_lo: string; code?: string | null; }
interface Condition { id: string; name_lo: string; factor_pct: number; }
interface PriceRow {
  price_per_m2: number;
  road_types: { id: string; name_lo: string; ltv_pct: number; sort_order: number };
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

// ແຖວຕົວເລກໃນສະຫຼຸບ
function Line({ label, value, muted, strong }: { label: React.ReactNode; value: React.ReactNode; muted?: boolean; strong?: boolean }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3 text-sm', muted && 'text-muted-foreground', strong && 'text-base font-semibold')}>
      <span>{label}</span>
      <span className="tabular-nums font-medium text-right">{value}</span>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [provinces, setProvinces] = useState<Row[]>([]);
  const [districts, setDistricts] = useState<Row[]>([]);
  const [villages, setVillages] = useState<Row[]>([]);
  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [maxLoan, setMaxLoan] = useState<number | null>(null);
  const [extraMultLand, setExtraMultLand] = useState<number>(2);
  const [extraMultBuilding, setExtraMultBuilding] = useState<number>(2);
  const [multLand, setMultLand] = useState(false);
  const [multBuilding, setMultBuilding] = useState(false);
  const [feeCfg, setFeeCfg] = useState<FeeConfig>(DEFAULT_FEE_CONFIG);
  const [feeLocation, setFeeLocation] = useState<'in_town' | 'out'>('in_town');
  const [feeDistance, setFeeDistance] = useState('20');
  const [actualLoan, setActualLoan] = useState('');
  const [titleDocs, setTitleDocs] = useState<File[]>([]);
  const [docPreviews, setDocPreviews] = useState<string[]>([]);
  const [showDoc, setShowDoc] = useState(false);
  const [docNo, setDocNo] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [instName, setInstName] = useState('');

  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [villageId, setVillageId] = useState('');
  const [roadTypeId, setRoadTypeId] = useState('');
  const [landArea, setLandArea] = useState('');
  const [hasBuilding, setHasBuilding] = useState(false);
  const [buildingTypeId, setBuildingTypeId] = useState('');
  const [conditionId, setConditionId] = useState('');
  const [completionPct, setCompletionPct] = useState('100');
  const [buildingArea, setBuildingArea] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMe().then(m => {
      if (!m) { router.replace('/login'); return; }
      setMe(m); setAuthed(true);
    });
  }, [router]);

  useEffect(() => {
    if (!me) return;
    supabase.from('provinces').select('id,name_lo,code').order('name_lo')
      .then(({ data }) => {
        const list = (data ?? []).filter((p: any) => me.isAdmin || me.provinceIds.includes(p.id));
        setProvinces(list);
        if (list.length === 1) setProvinceId(list[0].id); // ແຂວງດຽວ → ເລືອກໃຫ້
      });
    supabase.from('building_types').select('id,name_lo,price_per_m2,ltv_pct')
      .eq('is_active', true).order('price_per_m2')
      .then(({ data }) => setBuildingTypes((data as BuildingType[]) ?? []));
    supabase.from('building_conditions').select('id,name_lo,factor_pct').order('sort_order')
      .then(({ data }) => setConditions((data as Condition[]) ?? []));
    supabase.from('settings').select('key,value_num,value_text')
      .then(({ data }) => {
        const m = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value_num]));
        const txt = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value_text]));
        setLogoUrl(txt.logo_url ?? '');
        setInstName(txt.inst_name ?? '');
        setMaxLoan(m.max_loan ?? null);
        if (m.extra_mult_land != null) setExtraMultLand(Number(m.extra_mult_land));
        if (m.extra_mult_building != null) setExtraMultBuilding(Number(m.extra_mult_building));
        setFeeCfg({
          serviceThreshold: m.fee_service_threshold ?? DEFAULT_FEE_CONFIG.serviceThreshold,
          serviceRateLow: m.fee_service_rate_low ?? DEFAULT_FEE_CONFIG.serviceRateLow,
          serviceRateHigh: m.fee_service_rate_high ?? DEFAULT_FEE_CONFIG.serviceRateHigh,
          assessInTown: m.fee_assess_in_town ?? DEFAULT_FEE_CONFIG.assessInTown,
          assessTier1: m.fee_assess_tier1 ?? DEFAULT_FEE_CONFIG.assessTier1,
          assessTier2: m.fee_assess_tier2 ?? DEFAULT_FEE_CONFIG.assessTier2,
          assessTier3: m.fee_assess_tier3 ?? DEFAULT_FEE_CONFIG.assessTier3,
          assessDist1: m.fee_assess_dist1 ?? DEFAULT_FEE_CONFIG.assessDist1,
          assessDist2: m.fee_assess_dist2 ?? DEFAULT_FEE_CONFIG.assessDist2,
        });
      });
  }, [me]);

  useEffect(() => {
    setDistrictId(''); setVillageId(''); setRoadTypeId('');
    setDistricts([]); setVillages([]); setPrices([]);
    if (!provinceId) return;
    supabase.from('districts').select('id,name_lo').eq('province_id', provinceId).order('name_lo')
      .then(({ data }) => setDistricts(data ?? []));
  }, [provinceId]);

  useEffect(() => {
    setVillageId(''); setRoadTypeId(''); setVillages([]); setPrices([]);
    if (!districtId) return;
    supabase.from('villages').select('id,name_lo').eq('district_id', districtId).order('seq')
      .then(({ data }) => setVillages(data ?? []));
  }, [districtId]);

  useEffect(() => {
    setRoadTypeId(''); setPrices([]);
    if (!villageId) return;
    supabase.from('land_prices')
      .select('price_per_m2, road_types(id,name_lo,ltv_pct,sort_order)')
      .eq('village_id', villageId)
      .then(({ data }) => {
        const rows = ((data as unknown) as PriceRow[]) ?? [];
        rows.sort((a, b) => a.road_types.sort_order - b.road_types.sort_order);
        setPrices(rows);
      });
  }, [villageId]);

  const province = useMemo(() => provinces.find(p => p.id === provinceId), [provinces, provinceId]);
  const selectedPrice = useMemo(() => prices.find(p => p.road_types.id === roadTypeId), [prices, roadTypeId]);
  const buildingType = useMemo(() => buildingTypes.find(b => b.id === buildingTypeId), [buildingTypes, buildingTypeId]);
  const condition = useMemo(() => conditions.find(c => c.id === conditionId), [conditions, conditionId]);

  const result = useMemo(() => {
    if (!selectedPrice || !landArea) return null;
    return calculateValuation({
      landAreaM2: parseFloat(landArea),
      landPricePerM2: selectedPrice.price_per_m2,
      landLtvPct: selectedPrice.road_types.ltv_pct,
      hasBuilding,
      buildingAreaM2: buildingArea ? parseFloat(buildingArea) : undefined,
      buildingType: hasBuilding ? buildingType : undefined,
      conditionFactorPct: condition?.factor_pct ?? 100,
      completionPct: Number(completionPct),
      maxLoan,
      landMultiplier: multLand ? extraMultLand : 1,
      buildingMultiplier: multBuilding ? extraMultBuilding : 1,
    });
  }, [selectedPrice, landArea, hasBuilding, buildingArea, buildingType, condition, completionPct, maxLoan, multLand, multBuilding, extraMultLand, extraMultBuilding]);

  const fees = useMemo(() => {
    if (!result) return null;
    const actual = parseFloat(actualLoan) || 0;
    const base = actual > 0 ? actual : result.totalLoan; // ຍອດປ່ອຍຈິງ, ວ່າງ = ວົງເງິນສູງສຸດ
    return calculateFees({
      totalLoan: base,
      location: feeLocation,
      distanceKm: Number(feeDistance),
    }, feeCfg);
  }, [result, actualLoan, feeLocation, feeDistance, feeCfg]);

  async function save() {
    if (!result || !selectedPrice) return;
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();

    // ອັບໂຫຼດຮູບໃບຕາດິນຂຶ້ນ Supabase Storage (bucket private — ເກັບ path)
    let docUrls: string[] = [];
    if (titleDocs.length && auth.user) {
      const up = await uploadDocs(auth.user.id, titleDocs);
      docUrls = up.paths;
      if (up.failed.length) toast.error('ອັບໂຫຼດຮູບບໍ່ສຳເລັດ: ' + up.failed.join(', '));
    }

    const { error } = await supabase.from('valuations').insert({
      borrower_first_name: firstName || null,
      borrower_last_name: lastName || null,
      village_id: villageId,
      road_type_id: roadTypeId,
      land_price_per_m2: selectedPrice.price_per_m2,
      land_ltv_pct: selectedPrice.road_types.ltv_pct,
      land_area_m2: parseFloat(landArea),
      land_value: result.landValue,
      land_loan: result.landLoan,
      building_type_id: hasBuilding ? buildingType?.id ?? null : null,
      building_condition_id: hasBuilding ? condition?.id ?? null : null,
      condition_factor: hasBuilding ? condition?.factor_pct ?? 100 : 100,
      completion_pct: hasBuilding ? Number(completionPct) : 100,
      building_area_m2: hasBuilding && buildingArea ? parseFloat(buildingArea) : null,
      building_value: result.buildingValue,
      building_loan: result.buildingLoan,
      land_multiplier: multLand ? extraMultLand : 1,
      building_multiplier: multBuilding ? extraMultBuilding : 1,
      fee_location: feeLocation,
      fee_distance_km: feeLocation === 'out' ? Number(feeDistance) : null,
      service_fee: fees?.serviceFee ?? 0,
      assess_fee: fees?.assessFee ?? 0,
      total_fee: fees?.totalFee ?? 0,
      total_value: result.totalValue,
      total_loan: result.totalLoan,
      actual_loan: Number(actualLoan) > 0 ? Number(actualLoan) : null,
      title_doc_urls: docUrls.length ? docUrls : null,
      doc_no: docNo || null,
      created_by: auth.user?.id ?? null,
    });
    setSaving(false);
    if (error) toast.error('ບັນທຶກບໍ່ສຳເລັດ: ' + error.message);
    else toast.success('ບັນທຶກສຳເລັດແລ້ວ');
    return !error;
  }

  // ---- ເລກທີ່ເອກະສານ: ລະຫັດແຂວງ + ວັນທີ + ລຳດັບ (ເຊັ່ນ LPB-20260101-001) ----
  function genDocNo(code: string) {
    let seq = 0;
    try { seq = (Number(localStorage.getItem('vapp_docseq')) || 0) + 1; localStorage.setItem('vapp_docseq', String(seq)); }
    catch { seq = 1; }
    const d = new Date(); const p = (n: number) => String(n).padStart(2, '0');
    return `${code || 'DOC'}-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${String(seq).padStart(3, '0')}`;
  }

  // "ອອກ PDF" → ເປີດໃບ (ຂໍ້ມູນຍັງຢູ່); ສ້າງເລກທີ່ຄັ້ງດຽວ ຮັກສາໄວ້ຕອນກັບໄປແກ້ໄຂ
  function openDoc() {
    if (!result || !fees) return;
    if (!docNo) setDocNo(genDocNo(province?.code || 'DOC'));
    setShowDoc(true);
  }

  // ລ້າງຟອມ ເລີ່ມຄີ່ໃໝ່
  function clearForm() {
    setFirstName(''); setLastName('');
    setProvinceId(provinces.length === 1 ? provinces[0].id : '');
    setDistrictId(''); setVillageId(''); setRoadTypeId(''); setLandArea('');
    setHasBuilding(false); setBuildingTypeId(''); setConditionId('');
    setCompletionPct('100'); setBuildingArea('');
    setMultLand(false); setMultBuilding(false);
    setFeeLocation('in_town'); setFeeDistance('20'); setActualLoan('');
    setTitleDocs([]); setDocPreviews([]);
    setDocNo('');
  }

  // "ພິມ / ບັນທຶກ PDF" → ບັນທຶກເລີຍ + ພິມ + ລ້າງຟອມ
  async function printAndSave() {
    const ok = await save();
    window.print();
    setShowDoc(false);
    if (ok) clearForm();
  }

  function onDocs(e: React.ChangeEvent<HTMLInputElement>) {
    const all = Array.from(e.target.files ?? []);
    const tooBig = all.filter(f => f.size > DOC_MAX_BYTES);
    if (tooBig.length) toast.error('ຮູບໃຫຍ່ເກີນ 20MB: ' + tooBig.map(f => f.name).join(', '));
    const files = all.filter(f => f.size <= DOC_MAX_BYTES);
    e.target.value = '';
    if (!files.length) return;
    setTitleDocs(prev => [...prev, ...files]);
    files.forEach(f => {
      const rd = new FileReader();
      rd.onload = () => setDocPreviews(prev => [...prev, String(rd.result)]);
      rd.readAsDataURL(f);
    });
  }
  function removeDoc(i: number) {
    setTitleDocs(prev => prev.filter((_, j) => j !== i));
    setDocPreviews(prev => prev.filter((_, j) => j !== i));
  }

  if (!authed || !me) return <PageLoading />;

  return (
    <>
      <AppHeader me={me} logoUrl={logoUrl} instName={instName} title="ປະເມີນທີ່ດິນ ເພື່ອຄຳນວນວົງເງິນປ່ອຍກູ້"
        nav={me.isAdmin ? { href: '/admin', label: 'ແກ້ຂໍ້ມູນ', icon: <Settings2 /> } : undefined} />

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ---------- ຟອມ ---------- */}
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="size-4 text-primary" />1. ຂໍ້ມູນຜູ້ຂໍກູ້</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="ຊື່" htmlFor="fn">
                <Input id="fn" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="ຊື່" />
              </Field>
              <Field label="ນາມສະກຸນ" htmlFor="ln">
                <Input id="ln" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="ນາມສະກຸນ" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="size-4 text-primary" />2. ຂໍ້ມູນທີ່ດິນ</CardTitle>
              <CardDescription>ເລືອກທີ່ຕັ້ງ ແລະ ປະເພດທາງ — ລາຄາດຶງຈາກຖານຂໍ້ມູນ</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="ແຂວງ">
                <NativeSelect className="w-full" value={provinceId} onChange={e => setProvinceId(e.target.value)} disabled={provinces.length === 1}>
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
                <NativeSelect className="w-full" value={villageId} onChange={e => setVillageId(e.target.value)} disabled={!districtId}>
                  <NativeSelectOption value="">— ເລືອກບ້ານ —</NativeSelectOption>
                  {villages.map(v => <NativeSelectOption key={v.id} value={v.id}>{v.name_lo}</NativeSelectOption>)}
                </NativeSelect>
              </Field>
              <Field label="ປະເພດທາງ">
                <NativeSelect className="w-full" value={roadTypeId} onChange={e => setRoadTypeId(e.target.value)} disabled={!villageId}>
                  <NativeSelectOption value="">— ເລືອກປະເພດທາງ —</NativeSelectOption>
                  {prices.map(p => (
                    <NativeSelectOption key={p.road_types.id} value={p.road_types.id}>
                      {p.road_types.name_lo} ({formatLAK(p.price_per_m2)}/ຕ.ມ. · {p.road_types.ltv_pct}%)
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="ເນື້ອທີ່ດິນ (ຕ.ມ.)" htmlFor="landArea">
                <Input id="landArea" type="number" min="0" value={landArea}
                  onChange={e => setLandArea(e.target.value)} placeholder="ເຊັ່ນ 200" />
              </Field>
              <div className="flex items-center gap-2 self-end pb-2">
                <Checkbox id="multLand" checked={multLand} onCheckedChange={v => setMultLand(v === true)} />
                <Label htmlFor="multLand">ຄູນພິເສດ ×{extraMultLand} (ດິນ)</Label>
              </div>
              {selectedPrice && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm sm:col-span-2">
                  <span className="text-muted-foreground">ລາຄາທີ່ເລືອກ:</span>
                  <span className="font-semibold tabular-nums">{formatLAK(selectedPrice.price_per_m2)}/ຕ.ມ.</span>
                  <Badge variant="outline">ປ່ອຍກູ້ໄດ້ {selectedPrice.road_types.ltv_pct}%</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Checkbox id="hasBuilding" checked={hasBuilding} onCheckedChange={v => setHasBuilding(v === true)} />
                <Label htmlFor="hasBuilding" className="flex items-center gap-2 text-base font-semibold">
                  <Building2 className="size-4 text-primary" />3. ມີສິ່ງປຸກສ້າງ
                </Label>
              </CardTitle>
              {!hasBuilding && <CardDescription>ຕິ໊ກ ຖ້າຫຼັກຊັບມີເຮືອນ ຫຼື ສິ່ງປຸກສ້າງ</CardDescription>}
            </CardHeader>
            {hasBuilding && (
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="ປະເພດສິ່ງປຸກສ້າງ">
                  <NativeSelect className="w-full" value={buildingTypeId} onChange={e => setBuildingTypeId(e.target.value)}>
                    <NativeSelectOption value="">— ເລືອກປະເພດ —</NativeSelectOption>
                    {buildingTypes.map(b => (
                      <NativeSelectOption key={b.id} value={b.id}>{b.name_lo} ({formatLAK(b.price_per_m2)}/ຕ.ມ. · {b.ltv_pct}%)</NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="ອາຍຸ (ຄ່າຫຼຸ້ຍຫ້ຽນ)">
                  <NativeSelect className="w-full" value={conditionId} onChange={e => setConditionId(e.target.value)}>
                    <NativeSelectOption value="">— ເລືອກອາຍຸ (ບໍ່ຫັກ = 100%) —</NativeSelectOption>
                    {conditions.map(c => <NativeSelectOption key={c.id} value={c.id}>{c.name_lo} ({c.factor_pct}%)</NativeSelectOption>)}
                  </NativeSelect>
                </Field>
                <Field label="ຄວາມສຳເລັດຂອງສິ່ງປຸກສ້າງ">
                  <NativeSelect className="w-full" value={completionPct} onChange={e => setCompletionPct(e.target.value)}>
                    <NativeSelectOption value="100">100% — ສ້າງສຳເລັດ</NativeSelectOption>
                    <NativeSelectOption value="90">90% — ບຸພື້ນ/ເພດານ/ທາສີ</NativeSelectOption>
                    <NativeSelectOption value="80">80% — ໄຟຟ້າ+ນ້ຳປະປາພ້ອມໃຊ້</NativeSelectOption>
                    <NativeSelectOption value="70">70% — ໃສ່ປະຕູ+ປ່ອງຢ້ຽມ</NativeSelectOption>
                    <NativeSelectOption value="60">60% — ມຸງຫຼັງຄາສຳເລັດ</NativeSelectOption>
                    <NativeSelectOption value="50">50% — ຕັ້ງເສົາ+ກໍ່ຝາ</NativeSelectOption>
                    <NativeSelectOption value="40">ຕ່ຳກວ່າ 50% — ບໍ່ປະເມີນ</NativeSelectOption>
                  </NativeSelect>
                </Field>
                <Field label="ເນື້ອທີ່ສິ່ງປຸກສ້າງ (ຕ.ມ.)" htmlFor="bArea">
                  <Input id="bArea" type="number" min="0" value={buildingArea}
                    onChange={e => setBuildingArea(e.target.value)} placeholder="ເຊັ່ນ 120" />
                </Field>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Checkbox id="multBuilding" checked={multBuilding} onCheckedChange={v => setMultBuilding(v === true)} />
                  <Label htmlFor="multBuilding">ຄູນພິເສດ ×{extraMultBuilding} (ສິ່ງປຸກສ້າງ)</Label>
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImagePlus className="size-4 text-primary" />4. ຮູບໃບຕາດິນ / ເອກະສານຫຼັກຊັບ</CardTitle>
              <CardDescription>ແນບໄດ້ຫຼາຍຮູບ (ບໍ່ເກີນ 20MB/ຮູບ) — ອັບໂຫຼດເຂົ້າ Storage ແບບ private ຕອນກົດບັນທຶກ</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-6 text-sm text-muted-foreground transition-colors hover:bg-muted/50">
                <ImagePlus className="size-6" />
                <span>ກົດເພື່ອເລືອກຮູບ</span>
                <input type="file" accept="image/*" multiple onChange={onDocs} className="sr-only" />
              </label>
              {docPreviews.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {docPreviews.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={src} alt="" className="size-20 rounded-lg border object-cover" />
                      <Button type="button" variant="outline" size="icon" onClick={() => removeDoc(i)}
                        className="absolute -top-2 -right-2 size-6 rounded-full text-destructive">
                        <X className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Receipt className="size-4 text-primary" />5. ຄ່າທຳນຽມ (ຫຼັກຊັບຄ້ຳ)</CardTitle>
              <CardDescription>ວົງເງິນປ່ອຍຈິງ ວ່າງ = ໃຊ້ວົງເງິນສູງສຸດ · ຫຼາຍຕອນ → ໃຊ້ຕອນທີ່ໄກສຸດ</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="ວົງເງິນປ່ອຍຈິງ (ກີບ)" htmlFor="actual">
                <Input id="actual" inputMode="numeric" value={groupDigits(actualLoan)}
                  onChange={e => setActualLoan(onlyDigits(e.target.value))} placeholder="ຄີ່ຍອດທີ່ປ່ອຍຈິງ" />
              </Field>
              <Field label="ທີ່ຕັ້ງຫຼັກຊັບ">
                <NativeSelect className="w-full" value={feeLocation} onChange={e => setFeeLocation(e.target.value as any)}>
                  <NativeSelectOption value="in_town">ໃນເມືອງ (ສູນກາງແຂວງ)</NativeSelectOption>
                  <NativeSelectOption value="out">ຕ່າງເມືອງ (ຄິດຕາມໄລຍະທາງ)</NativeSelectOption>
                </NativeSelect>
              </Field>
              {feeLocation === 'out' && (
                <Field label="ໄລຍະທາງ (ຕອນໄກສຸດ)">
                  <NativeSelect className="w-full" value={feeDistance} onChange={e => setFeeDistance(e.target.value)}>
                    <NativeSelectOption value={String(feeCfg.assessDist1 - 1)}>{feeCfg.assessDist1} ກິໂລແມັດ ລົງມາ</NativeSelectOption>
                    <NativeSelectOption value={String(feeCfg.assessDist1 + 1)}>{feeCfg.assessDist1 + 1}–{feeCfg.assessDist2} ກິໂລແມັດ</NativeSelectOption>
                    <NativeSelectOption value={String(feeCfg.assessDist2 + 1)}>{feeCfg.assessDist2 + 1} ກິໂລແມັດ ຂຶ້ນໄປ</NativeSelectOption>
                  </NativeSelect>
                </Field>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ---------- ສະຫຼຸບຜົນ (ຕິດຂ້າງ) ---------- */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className={cn(result && 'ring-1 ring-primary/30')}>
            <CardHeader>
              <CardTitle>ຜົນການຄຳນວນ</CardTitle>
              {!result && <CardDescription>ເລືອກປະເພດທາງ ແລະ ໃສ່ເນື້ອທີ່ດິນ ເພື່ອເບິ່ງຜົນ</CardDescription>}
            </CardHeader>
            {result && (
              <CardContent className="grid gap-3">
                <Line label="ມູນຄ່າດິນ" value={formatLAK(result.landValue)} />
                <Line muted label={`ວົງເງິນຈາກດິນ (${selectedPrice?.road_types.ltv_pct}%)`} value={formatLAK(result.landLoan)} />
                {hasBuilding && result.buildingValue > 0 && <>
                  <Line label={<>ມູນຄ່າສິ່ງປຸກສ້າງ{condition ? ` (ອາຍຸ ${condition.factor_pct}%)` : ''}{completionPct !== '100' ? ` (ສຳເລັດ ${completionPct}%)` : ''}</>}
                    value={formatLAK(result.buildingValue)} />
                  <Line muted label={`ວົງເງິນຈາກສິ່ງປຸກສ້າງ (${buildingType?.ltv_pct}%)`} value={formatLAK(result.buildingLoan)} />
                </>}
                {hasBuilding && buildingType && Number(completionPct) < 50 && (
                  <p className="text-xs text-muted-foreground">ຄວາມສຳເລັດຕ່ຳກວ່າ 50% — ບໍ່ປະເມີນມູນຄ່າສິ່ງປຸກສ້າງ</p>
                )}
                <Separator />
                <Line label="ມູນຄ່າລວມ" value={formatLAK(result.totalValue)} />
                {result.cappedBy != null && (
                  <Line muted label="ວົງເງິນຄຳນວນ (ກ່ອນຈຳກັດ)" value={formatLAK(result.rawLoan)} />
                )}
                <div className="rounded-lg bg-primary px-4 py-3 text-primary-foreground">
                  <div className="text-xs opacity-80">ວົງເງິນປ່ອຍກູ້ສູງສຸດ{result.cappedBy != null ? ' (ຈຳກັດ)' : ''}</div>
                  <div className="text-2xl font-bold tabular-nums">{formatLAK(result.totalLoan)}</div>
                </div>

                {fees && <>
                  <Separator />
                  {Number(actualLoan) > 0 && <Line label="ວົງເງິນປ່ອຍຈິງ" value={formatLAK(Number(actualLoan))} />}
                  <Line muted label={`ຄ່າທຳນຽມບໍລິການ (${fees.serviceRate}%)`} value={formatLAK(fees.serviceFee)} />
                  <Line muted label="ຄ່າລົງປະເມີນຫຼັກຊັບ" value={formatLAK(fees.assessFee)} />
                  <Line strong label={`ລວມຄ່າທຳນຽມ (ຈາກ${Number(actualLoan) > 0 ? 'ວົງເງິນຈິງ' : 'ວົງເງິນສູງສຸດ'})`} value={formatLAK(fees.totalFee)} />
                </>}
              </CardContent>
            )}
            {result && fees && (
              <CardFooter>
                <Button size="lg" className="w-full" onClick={openDoc}><FileText />ອອກ PDF</Button>
              </CardFooter>
            )}
          </Card>
        </aside>
      </main>

      {showDoc && result && fees && (
        <div className="printsheet fixed inset-0 z-50 overflow-auto bg-muted p-4">
          <div className="noprint mx-auto mb-4 flex max-w-[720px] gap-2">
            <Button variant="outline" onClick={() => setShowDoc(false)}><ArrowLeft />ກັບໄປແກ້ໄຂ</Button>
            <Button onClick={printAndSave} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Printer />}
              {saving ? 'ກຳລັງບັນທຶກ…' : 'ພິມ / ບັນທຶກ PDF'}
            </Button>
          </div>
          <div className="doc">
            <div className="dhead">
              {logoUrl && <img src={logoUrl} alt="" />}
              <div><h1>{instName || 'ສະຖາບັນການເງິນ'}</h1><div className="dsub">ໃບຢັ້ງຢືນການປະເມີນຫຼັກຊັບ</div></div>
            </div>
            <h2 className="dtitle">ໃບຢັ້ງຢືນການປະເມີນ ເພື່ອປ່ອຍກູ້</h2>
            <div className="drow"><span>ເລກທີ່ເອກະສານ</span><b>{docNo}</b></div>
            <div className="drow"><span>ວັນທີອ້າງອີງ</span><b>{new Date().toLocaleDateString('lo-LA', { year: 'numeric', month: 'long', day: 'numeric' })}</b></div>
            <div className="drow"><span>ຊື່ຜູ້ຂໍກູ້</span><b>{`${firstName} ${lastName}`.trim() || '(ບໍ່ມີຊື່)'}</b></div>
            <div className="drow"><span>ທີ່ຕັ້ງຫຼັກຊັບ</span><b>
              {[provinces.find(p => p.id === provinceId)?.name_lo,
                districts.find(d => d.id === districtId)?.name_lo,
                villages.find(v => v.id === villageId)?.name_lo].filter(Boolean).join(' · ')}
            </b></div>
            <div className="drow"><span>ປະເພດທາງ</span><b>{selectedPrice?.road_types.name_lo}</b></div>
            <div className="drow"><span>ວັນທີປະເມີນ</span><b>{new Date().toLocaleDateString('lo-LA', { year: 'numeric', month: 'long', day: 'numeric' })}</b></div>

            <div className="dsect">ຜົນການປະເມີນ</div>
            <div className="drow"><span>ວົງເງິນປ່ອຍກູ້ສູງສຸດ</span><b>{formatLAK(result.totalLoan)}</b></div>
            {Number(actualLoan) > 0 && <div className="drow"><span>ວົງເງິນປ່ອຍຈິງ</span><b>{formatLAK(Number(actualLoan))}</b></div>}
            <div className="drow"><span>ຄ່າທຳນຽມບໍລິການ</span><b>{formatLAK(fees.serviceFee)}</b></div>
            <div className="drow"><span>ຄ່າລົງປະເມີນຫຼັກຊັບ</span><b>{formatLAK(fees.assessFee)}</b></div>
            <div className="drow"><span>ລວມຄ່າທຳນຽມ</span><b>{formatLAK(fees.totalFee)}</b></div>

            {docPreviews.length > 0 && <>
              <div className="dsect">ຮູບໃບຕາດິນ / ຫຼັກຊັບ</div>
              <div className="imgs">{docPreviews.map((s, i) => <img key={i} src={s} alt="" />)}</div>
            </>}

            <div className="sign">
              <div className="box"><div className="line"></div><div className="role">ຜູ້ປະເມີນ</div><div className="nm">{me.full_name || me.username}</div></div>
              <div className="box"><div className="line"></div><div className="role">ຜູ້ຮັບຮອງການປະເມີນ</div><div className="nm">( ..................................... )</div></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
