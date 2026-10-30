// ========================================================================
// src/components/loader.tsx — ວົງແຫວນໂຫຼດ: ແຕ່ລະວົງໝຸນໄປ-ກັບ (ຊ້າຍ↔ຂວາ)
// ວົງທີ່ຕິດກັນໝຸນສວນທາງກັນ · ສີຕາມ currentColor (ຄ່າເລີ່ມຕົ້ນ text-primary)
// ========================================================================
import { cn } from '@/lib/utils';

export function Loader({ label = 'ກຳລັງໂຫຼດ…', className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn('relative size-44 text-primary', className)}>
      <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" className="size-full">
        {/* ວົງນອກ — ໂຄ້ງໜາ 3 ທ່ອນ (ທ່ອນໜຶ່ງຈາງ) */}
        <g className="loader-ring loader-cw" style={{ animationDuration: '3.2s' }}>
          <circle cx="100" cy="100" r="92" strokeWidth="7" pathLength={100} strokeDasharray="12 22 26 40" />
          <circle cx="100" cy="100" r="92" strokeWidth="7" pathLength={100} strokeDasharray="0 74 18 8" opacity=".45" />
        </g>
        {/* ວົງເສັ້ນບາງເຕັມວົງ */}
        <circle cx="100" cy="100" r="80" strokeWidth="2.5" />
        {/* ວົງກາງ — ໂຄ້ງໜາ */}
        <g className="loader-ring loader-ccw" style={{ animationDuration: '2.6s' }}>
          <circle cx="100" cy="100" r="68" strokeWidth="8" pathLength={100} strokeDasharray="18 12 30 10 14 16" />
        </g>
        {/* ວົງໃນ — ເສັ້ນບາງມີຊ່ອງ */}
        <g className="loader-ring loader-cw" style={{ animationDuration: '2s' }}>
          <circle cx="100" cy="100" r="57" strokeWidth="2.5" pathLength={100} strokeDasharray="22 6 30 8 26 8" />
        </g>
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-semibold">{label}</span>
    </div>
  );
}
