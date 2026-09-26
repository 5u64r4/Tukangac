import { Order, Technician, AreaPriorityRule, TechnicianCustomFee, CrowdsourcingConfig } from '../types';
import { INITIAL_AREA_PRIORITY_RULES, INITIAL_CUSTOM_FEES } from '../data/initialData';

const STORAGE_KEY_AREA_RULES = 'tukang_ac_area_priority_rules';
const STORAGE_KEY_CUSTOM_FEES = 'tukang_ac_technician_custom_fees';

/**
 * Load saved area priority rules from localStorage with initial fallback
 */
export function getSavedAreaPriorityRules(): AreaPriorityRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AREA_RULES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read saved area priority rules:', e);
  }
  return INITIAL_AREA_PRIORITY_RULES;
}

/**
 * Persist area priority rules to localStorage and dispatch event
 */
export function saveAreaPriorityRules(rules: AreaPriorityRule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_AREA_RULES, JSON.stringify(rules));
    window.dispatchEvent(new CustomEvent('tukang_ac_priority_rules_changed', { detail: rules }));
  } catch (e) {
    console.warn('Could not save area priority rules:', e);
  }
}

/**
 * Load technician custom fees from localStorage with initial fallback
 */
export function getSavedTechnicianCustomFees(): TechnicianCustomFee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_FEES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read saved custom fees:', e);
  }
  return INITIAL_CUSTOM_FEES;
}

export const getSavedCustomFees = getSavedTechnicianCustomFees;

/**
 * Persist technician custom fees to localStorage and dispatch event
 */
export function saveTechnicianCustomFees(fees: TechnicianCustomFee[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_FEES, JSON.stringify(fees));
    window.dispatchEvent(new CustomEvent('tukang_ac_custom_fees_changed', { detail: fees }));
  } catch (e) {
    console.warn('Could not save custom fees:', e);
  }
}

export const saveCustomFees = saveTechnicianCustomFees;

/**
 * Match an order's address to the best active Area Priority Rule
 */
export function matchOrderToPriorityRule(
  order: Partial<Order>,
  rules: AreaPriorityRule[] = getSavedAreaPriorityRules()
): {
  matchedRule: AreaPriorityRule | null;
  matchScore: number;
  matchReason: string;
} {
  const address = (order.fullAddress || order.addressLabel || '').toLowerCase();
  if (!address) {
    return { matchedRule: null, matchScore: 0, matchReason: 'Alamat kosong' };
  }

  let bestRule: AreaPriorityRule | null = null;
  let highestScore = 0;
  let bestReason = '';

  for (const rule of rules) {
    if (!rule.isActive) continue;

    let currentScore = 0;
    let matchedKeywords: string[] = [];

    // Check specific subdistricts / kelurahan / kawasan (highest specificity)
    if (Array.isArray(rule.subdistricts)) {
      for (const sub of rule.subdistricts) {
        const subLower = sub.toLowerCase().trim();
        if (subLower && address.includes(subLower)) {
          currentScore += 30;
          matchedKeywords.push(sub);
        }
      }
    }

    // Check district / kecamatan
    const distLower = rule.district.toLowerCase().replace(/kecamatan|kec\./g, '').trim();
    if (distLower && address.includes(distLower)) {
      currentScore += 20;
      matchedKeywords.push(rule.district);
    }

    // Check city
    const cityLower = rule.city.toLowerCase().replace(/kota|kabupaten|kab\.|dki/g, '').trim();
    if (cityLower && address.includes(cityLower)) {
      currentScore += 10;
      matchedKeywords.push(rule.city);
    }

    if (currentScore > highestScore) {
      highestScore = currentScore;
      bestRule = rule;
      bestReason = matchedKeywords.length > 0 
        ? `Cocok dengan wilayah: ${matchedKeywords.slice(0, 2).join(', ')}`
        : `Kecocokan area: ${rule.areaName}`;
    }
  }

  return {
    matchedRule: highestScore >= 20 ? bestRule : null,
    matchScore: highestScore,
    matchReason: bestReason
  };
}

/**
 * Calculate financial fee breakdown for an order, accounting for Technician Custom Fees
 */
export function calculateOrderFeeBreakdown(
  order: Order,
  config: CrowdsourcingConfig,
  customFees: TechnicianCustomFee[] = getSavedTechnicianCustomFees()
): {
  feePercent: number;
  platformCut: number;
  netTechnician: number;
  isCustomFeeApplied: boolean;
  customFeeRule?: TechnicianCustomFee;
  subsidyBonus: number;
} {
  const techName = order.technicianName || '';
  const service = (order.serviceName || '').toLowerCase();

  // Find active custom fee rule for this technician
  const customRule = customFees.find(
    (cf) => cf.isEnabled && (
      cf.technicianName.toLowerCase() === techName.toLowerCase() ||
      cf.technicianId === order.technicianName
    )
  );

  let feePercent = config.defaultFeePercent || 20;
  let isCustom = false;
  let subsidy = 0;

  if (customRule && customRule.isEnabled) {
    isCustom = true;
    subsidy = customRule.subsidyPerOrderNominal || 0;

    if (service.includes('cuci') && customRule.cuciAcFeePercent !== undefined) {
      feePercent = customRule.cuciAcFeePercent;
    } else if ((service.includes('perbaikan') || service.includes('rusak') || service.includes('bocor')) && customRule.perbaikanAcFeePercent !== undefined) {
      feePercent = customRule.perbaikanAcFeePercent;
    } else if (service.includes('freon') && customRule.isiFreonFeePercent !== undefined) {
      feePercent = customRule.isiFreonFeePercent;
    } else if ((service.includes('bongkar') || service.includes('pasang')) && customRule.bongkarPasangFeePercent !== undefined) {
      feePercent = customRule.bongkarPasangFeePercent;
    } else {
      feePercent = customRule.customFeePercent;
    }
  } else {
    // Default tier calculation
    if (service.includes('cuci')) feePercent = config.cuciAcFeePercent || config.defaultFeePercent;
    else if (service.includes('perbaikan') || service.includes('rusak') || service.includes('bocor')) feePercent = config.perbaikanAcFeePercent || config.defaultFeePercent;
    else if (service.includes('freon')) feePercent = config.isiFreonFeePercent || config.defaultFeePercent;
    else if (service.includes('bongkar') || service.includes('pasang')) feePercent = config.bongkarPasangFeePercent || config.defaultFeePercent;
    else feePercent = config.defaultFeePercent;
  }

  const platformCut = Math.max(0, Math.round(order.totalPrice * (feePercent / 100)));
  const netTechnician = Math.max(0, order.totalPrice - platformCut + subsidy);

  return {
    feePercent,
    platformCut,
    netTechnician,
    isCustomFeeApplied: isCustom,
    customFeeRule: customRule,
    subsidyBonus: subsidy
  };
}
