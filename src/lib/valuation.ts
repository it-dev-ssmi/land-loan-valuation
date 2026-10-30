// ========================================================================
// src/lib/valuation.ts
// ຫົວໃຈການຄຳນວນ: ມູນຄ່າ + ວົງເງິນປ່ອຍກູ້ (pure function)
// ລາຄາ, %, ຕົວຄູນສະພາບ, ວົງເງິນສູງສຸດ — ຖືກສົ່ງເຂົ້າມາຈາກຖານຂໍ້ມູນ
// ========================================================================

export interface BuildingType {
  id: string;
  name_lo: string;
  price_per_m2: number; // ມູນຄ່າກໍ່ສ້າງ/ຕ.ມ. (ກີບ) — ຈາກ DB
  ltv_pct: number;      // % ປ່ອຍກູ້ຂອງສິ່ງປຸກສ້າງ — ຈາກ DB
}

export interface ValuationInput {
  landAreaM2: number;
  landPricePerM2: number; // ລາຄາດິນ/ຕ.ມ. (ບ້ານ × ປະເພດທາງ) — ຈາກ DB
  landLtvPct: number;     // % ປ່ອຍກູ້ຂອງປະເພດທາງ — ຈາກ DB
  hasBuilding: boolean;
  buildingAreaM2?: number;
  buildingType?: BuildingType;
  conditionFactorPct?: number; // ຄ່າຫຼຸ້ຍຫ້ຽນຕາມອາຍຸ % (80/60/40/20) — ຈາກ DB
  completionPct?: number;      // ຄວາມສຳເລັດຂອງສິ່ງປຸກສ້າງ % (50–100; <50 = ບໍ່ປະເມີນ)
  maxLoan?: number | null;     // ວົງເງິນສູງສຸດ (null/undefined = ບໍ່ຈຳກັດ) — ຈາກ settings
  landMultiplier?: number;     // ຕົວຄູນພິເສດຂອງດິນ (default 1 = ບໍ່ຄູນ) — ຈາກ settings
  buildingMultiplier?: number; // ຕົວຄູນພິເສດຂອງສິ່ງປຸກສ້າງ (default 1) — ຈາກ settings
}

export interface ValuationResult {
  landValue: number;
  landLoan: number;
  buildingValue: number;      // ຫຼັງຫັກຄ່າຫຼຸ້ຍຫ້ຽນແລ້ວ
  buildingLoan: number;
  totalValue: number;
  rawLoan: number;            // ວົງເງິນກ່ອນຈຳກັດ
  totalLoan: number;          // ວົງເງິນສຸດທ້າຍ (ຫຼັງ cap ຖ້າມີ)
  cappedBy?: number;          // ຖ້າຖືກຈຳກັດ ຈະບອກວ່າ cap ເທົ່າໃດ
}

/**
 *   ມູນຄ່າດິນ          = ເນື້ອທີ່ດິນ × ລາຄາດິນ/ຕ.ມ.
 *   ວົງເງິນຈາກດິນ      = ມູນຄ່າດິນ × (landLtvPct / 100)
 *   ມູນຄ່າສິ່ງປຸກສ້າງ   = ເນື້ອທີ່ × ລາຄາກໍ່ສ້າງ/ຕ.ມ. × (ຄວາມສຳເລັດ%/100) × (ອາຍຸ%/100)
 *                        (ຄວາມສຳເລັດ < 50% = ບໍ່ປະເມີນ = 0)
 *   ວົງເງິນຈາກສິ່ງປຸກສ້າງ = ມູນຄ່າ × (buildingType.ltv_pct / 100)
 *   ວົງເງິນລວມ         = ວົງເງິນຈາກດິນ + ວົງເງິນຈາກສິ່ງປຸກສ້າງ
 *                        (ຈຳກັດດ້ວຍ maxLoan ຖ້າຕັ້ງໄວ້)
 */
export function calculateValuation(input: ValuationInput): ValuationResult {
  const multLand = input.landMultiplier && input.landMultiplier > 0 ? input.landMultiplier : 1;
  const multBuilding = input.buildingMultiplier && input.buildingMultiplier > 0 ? input.buildingMultiplier : 1;

  const landArea = Math.max(0, Number(input.landAreaM2) || 0);
  const landValue = Math.round(landArea * input.landPricePerM2 * multLand);
  const landLoan = Math.round(landValue * (input.landLtvPct / 100));

  let buildingValue = 0;
  let buildingLoan = 0;
  if (input.hasBuilding && input.buildingType && input.buildingAreaM2) {
    const bArea = Math.max(0, Number(input.buildingAreaM2) || 0);
    const ageFactor = (input.conditionFactorPct ?? 100) / 100;        // ຄ່າຫຼຸ້ຍຫ້ຽນຕາມອາຍຸ
    const completion = (input.completionPct ?? 100);                  // ຄວາມສຳເລັດ %
    const compFactor = completion < 50 ? 0 : completion / 100;        // <50% = ບໍ່ປະເມີນ
    buildingValue = Math.round(bArea * input.buildingType.price_per_m2 * compFactor * ageFactor * multBuilding);
    buildingLoan = Math.round(buildingValue * (input.buildingType.ltv_pct / 100));
  }

  const rawLoan = landLoan + buildingLoan;
  let totalLoan = rawLoan;
  let cappedBy: number | undefined;
  if (input.maxLoan != null && input.maxLoan > 0 && rawLoan > input.maxLoan) {
    totalLoan = input.maxLoan;
    cappedBy = input.maxLoan;
  }

  return {
    landValue, landLoan, buildingValue, buildingLoan,
    totalValue: landValue + buildingValue,
    rawLoan, totalLoan, cappedBy,
  };
}

/** ຈັດຮູບແບບເງິນກີບ: 1,250,000 ₭ */
export function formatLAK(n: number): string {
  return new Intl.NumberFormat('lo-LA').format(Math.round(n)) + ' ₭';
}

/** ສຳລັບຊ່ອງ input ເງິນ: ສະແດງຈຸດຂັ້ນຫຼັກພັນ (5000000 → "5,000,000") */
export function groupDigits(s: string | number): string {
  const d = String(s ?? '').replace(/[^0-9]/g, '');
  return d ? Number(d).toLocaleString('en-US') : '';
}
/** ເອົາສະເພາະຕົວເລກ (ຕັດ comma ອອກ) */
export function onlyDigits(s: string): string {
  return String(s ?? '').replace(/[^0-9]/g, '');
}

// ========================================================================
// ຄ່າທຳນຽມ (ມາດຕາ 6)
// ========================================================================
export interface FeeConfig {
  // 6.1 ຄ່າທຳນຽມບໍລິການ: % ຂອງວົງເງິນກູ້ (ຂຶ້ນກັບ threshold)
  serviceThreshold: number;   // ຄ່າເລີ່ມຕົ້ນ 50,000,000
  serviceRateLow: number;     // % ສຳລັບວົງເງິນ ≤ threshold (ຄ່າເລີ່ມຕົ້ນ 1)
  serviceRateHigh: number;    // % ສຳລັບວົງເງິນ > threshold (ຄ່າເລີ່ມຕົ້ນ 0.5)
  // 6.2 ຄ່າລົງປະເມີນຫຼັກຊັບ (ກີບ)
  assessInTown: number;       // ໃນເມືອງ (300,000)
  assessTier1: number;        // ຕ່າງເມືອງ ≤ dist1 km (400,000)
  assessTier2: number;        // dist1–dist2 km (600,000)
  assessTier3: number;        // > dist2 km (800,000)
  assessDist1: number;        // 30
  assessDist2: number;        // 80
}

export const DEFAULT_FEE_CONFIG: FeeConfig = {
  serviceThreshold: 50000000, serviceRateLow: 1, serviceRateHigh: 0.5,
  assessInTown: 300000, assessTier1: 400000, assessTier2: 600000, assessTier3: 800000,
  assessDist1: 30, assessDist2: 80,
};

export interface FeeInput {
  totalLoan: number;              // ວົງເງິນປ່ອຍກູ້ (ຈາກ calculateValuation)
  location: 'in_town' | 'out';    // ທີ່ຕັ້ງຫຼັກຊັບ
  distanceKm?: number;            // ໄລຍະທາງ (ຕອນທີ່ໄກສຸດ ຖ້າມີຫຼາຍຕອນ) — ສຳລັບ 'out'
}

export interface FeeResult {
  serviceRate: number;    // % ທີ່ໃຊ້
  serviceFee: number;     // ຄ່າທຳນຽມບໍລິການ
  assessFee: number;      // ຄ່າລົງປະເມີນ
  totalFee: number;       // ລວມຄ່າທຳນຽມ
}

/**
 * 6.1 ຄ່າບໍລິການ = ວົງເງິນ × (≤threshold ? rateLow : rateHigh) / 100
 * 6.2 ຄ່າລົງປະເມີນ = ໃນເມືອງ → assessInTown ;
 *      ຕ່າງເມືອງ → ≤dist1 ? tier1 : ≤dist2 ? tier2 : tier3 (ເອົາຕອນໄກສຸດ)
 */
export function calculateFees(input: FeeInput, cfg: FeeConfig = DEFAULT_FEE_CONFIG): FeeResult {
  const loan = Math.max(0, Number(input.totalLoan) || 0);
  const serviceRate = loan > cfg.serviceThreshold ? cfg.serviceRateHigh : cfg.serviceRateLow;
  const serviceFee = Math.round(loan * serviceRate / 100);

  let assessFee: number;
  if (input.location === 'in_town') {
    assessFee = cfg.assessInTown;
  } else {
    const d = Math.max(0, Number(input.distanceKm) || 0);
    assessFee = d <= cfg.assessDist1 ? cfg.assessTier1
      : d <= cfg.assessDist2 ? cfg.assessTier2 : cfg.assessTier3;
  }
  return { serviceRate, serviceFee, assessFee, totalFee: serviceFee + assessFee };
}

