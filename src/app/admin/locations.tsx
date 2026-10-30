'use client';

// ========================================================================
// src/app/admin/locations.tsx — ແທັບ admin: ຈັດການ ແຂວງ → ເມືອງ → ບ້ານ
// ເພີ່ມ / ແກ້ຊື່ / ລຶບ (ລຶບແຂວງ/ເມືອງ ລຶບລູກທັງໝົດນຳ ຕາມ on delete cascade)
// ສິດ: RLS — ແຂວງ admin ເທົ່ານັ້ນ; ເມືອງ/ບ້ານ ຕາມສິດແຂວງ (0002_auth.sql)
// ========================================================================

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, ChevronRight, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface GeoItem { id: string; name_lo: string; code?: string | null; seq?: number | null; }

// ຖັນລາຍການ 1 ລະດັບ: ກົດເລືອກ, ແກ້ຊື່ໃນແຖວ, ເພີ່ມທາງລຸ່ມ
function GeoList({ title, desc, items, selected, onSelect, onAdd, onSave, onDelete, withCode, emptyMsg }: {
  title: string; desc: string; items: GeoItem[] | null;
  selected?: string; onSelect?: (id: string) => void;
  onAdd: (name: string, code: string) => Promise<boolean>;
  onSave: (it: GeoItem, name: string, code: string) => Promise<boolean>;
  onDelete: (it: GeoItem) => void;
  withCode?: boolean; emptyMsg?: string;
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [editId, setEditId] = useState('');
  const [eName, setEName] = useState('');
  const [eCode, setECode] = useState('');
  const [q, setQ] = useState('');

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (await onAdd(name.trim(), code.trim().toUpperCase())) { setName(''); setCode(''); }
  }
  async function save(it: GeoItem) {
    if (!eName.trim()) return;
    if (await onSave(it, eName.trim(), eCode.trim().toUpperCase())) setEditId('');
  }
  const shown = (items ?? []).filter(it => !q.trim() || it.name_lo.includes(q.trim()));

  return (
    <Card className="flex min-h-[28rem] flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          {title}{items && <Badge variant="secondary">{items.length}</Badge>}
        </CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {items === null ? <p className="text-sm text-muted-foreground">{emptyMsg}</p> : <>
          {items.length > 8 && (
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8" value={q} onChange={e => setQ(e.target.value)} placeholder="ຄົ້ນຫາ…" />
            </div>
          )}
          <div className="-mx-2 max-h-96 flex-1 overflow-y-auto">
            {!shown.length && <p className="px-2 py-6 text-center text-sm text-muted-foreground">ຍັງບໍ່ມີລາຍການ</p>}
            {shown.map(it => editId === it.id ? (
              <form key={it.id} onSubmit={e => { e.preventDefault(); save(it); }} className="flex items-center gap-1.5 px-2 py-1">
                <Input autoFocus value={eName} onChange={e => setEName(e.target.value)} className="min-w-0 flex-1" />
                {withCode && <Input value={eCode} onChange={e => setECode(e.target.value)} placeholder="ລະຫັດ" className="w-[4.5rem] shrink-0 uppercase" maxLength={6} />}
                <Button type="submit" size="icon" variant="ghost" className="shrink-0" title="ບັນທຶກ"><Check /></Button>
                <Button type="button" size="icon" variant="ghost" className="shrink-0" title="ຍົກເລີກ" onClick={() => setEditId('')}><X /></Button>
              </form>
            ) : (
              <div key={it.id}
                className={cn('group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm',
                  onSelect && 'cursor-pointer hover:bg-muted',
                  selected === it.id && 'bg-primary/10 font-medium text-primary hover:bg-primary/10')}
                onClick={() => onSelect?.(it.id)}>
                <span className="min-w-0 flex-1 truncate">{it.name_lo}</span>
                {withCode && it.code && <Badge variant="outline">{it.code}</Badge>}
                <Button size="icon" variant="ghost" className="size-7 opacity-60 group-hover:opacity-100" title="ແກ້ຊື່"
                  onClick={e => { e.stopPropagation(); setEditId(it.id); setEName(it.name_lo); setECode(it.code ?? ''); }}>
                  <Pencil />
                </Button>
                <Button size="icon" variant="ghost" className="size-7 text-destructive opacity-60 group-hover:opacity-100" title="ລຶບ"
                  onClick={e => { e.stopPropagation(); onDelete(it); }}>
                  <Trash2 />
                </Button>
                {onSelect && <ChevronRight className="size-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
          {/* ແຖວດຽວ: [ຊື່ ຍາວ] [ລະຫັດ ສັ້ນ — ແຂວງເທົ່ານັ້ນ] [+ ເພີ່ມ] */}
          <form onSubmit={add} className="flex items-center gap-2 border-t pt-3">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder={`ຊື່${title}ໃໝ່`} className="min-w-0 flex-1" />
            {withCode && <Input value={code} onChange={e => setCode(e.target.value)} placeholder="ລະຫັດ" title="ລະຫັດ ເຊັ່ນ VTE" className="w-[4.5rem] shrink-0 uppercase" maxLength={6} />}
            <Button type="submit" disabled={!name.trim()} className="shrink-0"><Plus />ເພີ່ມ</Button>
          </form>
        </>}
      </CardContent>
    </Card>
  );
}

export function Locations() {
  const [provinces, setProvinces] = useState<GeoItem[]>([]);
  const [districts, setDistricts] = useState<GeoItem[]>([]);
  const [villages, setVillages] = useState<GeoItem[]>([]);
  const [provId, setProvId] = useState('');
  const [distId, setDistId] = useState('');

  const loadProv = () => supabase.from('provinces').select('id,name_lo,code').order('name_lo').then(({ data }) => setProvinces(data ?? []));
  const loadDist = (pid: string) => supabase.from('districts').select('id,name_lo').eq('province_id', pid).order('name_lo').then(({ data }) => setDistricts(data ?? []));
  const loadVil = (did: string) => supabase.from('villages').select('id,name_lo,seq').eq('district_id', did).order('seq').then(({ data }) => setVillages(data ?? []));

  useEffect(() => { loadProv(); }, []);
  useEffect(() => { setDistId(''); setDistricts([]); setVillages([]); if (provId) loadDist(provId); }, [provId]);
  useEffect(() => { setVillages([]); if (distId) loadVil(distId); }, [distId]);

  // ລັນຄຳສັ່ງ → toast ຜົນ (ແປ error ທີ່ພົບເລື້ອຍເປັນຂໍ້ຄວາມເຂົ້າໃຈງ່າຍ)
  async function run(q: PromiseLike<{ error: { code?: string; message: string } | null }>, reload: () => unknown, msg = 'ບັນທຶກແລ້ວ') {
    const { error } = await q;
    if (error) {
      if (error.code === '23503') toast.error('ລຶບບໍ່ໄດ້ — ມີການປະເມີນທີ່ອ້າງອີງລາຍການນີ້ຢູ່');
      else if (error.code === '23505') toast.error('ລະຫັດນີ້ມີແລ້ວ');
      else toast.error('ຜິດພາດ: ' + error.message);
      return false;
    }
    toast.success(msg); reload(); return true;
  }
  const confirmDel = (what: string, it: GeoItem, cascade: string) =>
    confirm(`ລຶບ${what} "${it.name_lo}"?\n\n${cascade}\nກູ້ຄືນບໍ່ໄດ້.`);

  const provName = provinces.find(p => p.id === provId)?.name_lo;
  const distName = districts.find(d => d.id === distId)?.name_lo;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <GeoList title="ແຂວງ" withCode items={provinces} selected={provId} onSelect={setProvId}
        desc="ກົດເລືອກແຂວງ ເພື່ອຈັດການເມືອງ · ລະຫັດໃຊ້ໃນເລກທີ່ເອກະສານ (ເຊັ່ນ LPB)"
        onAdd={(name, code) => run(supabase.from('provinces').insert({ name_lo: name, code: code || null }), loadProv, 'ເພີ່ມແຂວງແລ້ວ')}
        onSave={(it, name, code) => run(supabase.from('provinces').update({ name_lo: name, code: code || null }).eq('id', it.id), loadProv)}
        onDelete={it => {
          if (!confirmDel('ແຂວງ', it, 'ເມືອງ, ບ້ານ ແລະ ລາຄາດິນທັງໝົດໃນແຂວງນີ້ຈະຖືກລຶບນຳ.')) return;
          run(supabase.from('provinces').delete().eq('id', it.id), () => { if (provId === it.id) setProvId(''); loadProv(); }, 'ລຶບແລ້ວ');
        }} />

      <GeoList title="ເມືອງ" items={provId ? districts : null} selected={distId} onSelect={setDistId}
        desc={provName ? `ໃນແຂວງ${provName}` : 'ເລືອກແຂວງກ່ອນ'} emptyMsg="← ເລືອກແຂວງກ່ອນ"
        onAdd={name => run(supabase.from('districts').insert({ province_id: provId, name_lo: name }), () => loadDist(provId), 'ເພີ່ມເມືອງແລ້ວ')}
        onSave={(it, name) => run(supabase.from('districts').update({ name_lo: name }).eq('id', it.id), () => loadDist(provId))}
        onDelete={it => {
          if (!confirmDel('ເມືອງ', it, 'ບ້ານ ແລະ ລາຄາດິນທັງໝົດໃນເມືອງນີ້ຈະຖືກລຶບນຳ.')) return;
          run(supabase.from('districts').delete().eq('id', it.id), () => { if (distId === it.id) setDistId(''); loadDist(provId); }, 'ລຶບແລ້ວ');
        }} />

      <GeoList title="ບ້ານ" items={distId ? villages : null}
        desc={distName ? `ໃນ${distName} · ລາຄາດິນແກ້ໄດ້ທີ່ແທັບ "ລາຄາດິນ"` : 'ເລືອກເມືອງກ່ອນ'} emptyMsg="← ເລືອກເມືອງກ່ອນ"
        onAdd={name => run(supabase.from('villages').insert({
          district_id: distId, name_lo: name,
          seq: Math.max(0, ...villages.map(v => v.seq ?? 0)) + 1, // ຕໍ່ທ້າຍລຳດັບ
        }), () => loadVil(distId), 'ເພີ່ມບ້ານແລ້ວ')}
        onSave={(it, name) => run(supabase.from('villages').update({ name_lo: name }).eq('id', it.id), () => loadVil(distId))}
        onDelete={it => {
          if (!confirmDel('ບ້ານ', it, 'ລາຄາດິນຂອງບ້ານນີ້ຈະຖືກລຶບນຳ.')) return;
          run(supabase.from('villages').delete().eq('id', it.id), () => loadVil(distId), 'ລຶບແລ້ວ');
        }} />
    </div>
  );
}
