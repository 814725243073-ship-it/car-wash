/**
 * Formats a numeric price into Indian Rupee (₹) format.
 * Example: 799 -> "₹799", 1499 -> "₹1,499"
 */
export function formatRupee(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount || 0);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN')}`;
}

export interface VehicleDetailsMeta {
  color?: string;
  soilLevel?: 'light' | 'moderate' | 'heavy';
  specialCare?: string[];
  year?: string;
}

/**
 * Parses extra vehicle details encoded in the appointment notes or string
 */
export function parseVehicleNotes(notes: string | null | undefined): {
  customerNotes: string;
  color?: string;
  soilLevel?: string;
  specialCare: string[];
} {
  if (!notes) {
    return { customerNotes: '', specialCare: [] };
  }

  const specialCare: string[] = [];
  let color: string | undefined;
  let soilLevel: string | undefined;
  const otherLines: string[] = [];

  const lines = notes.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Color:')) {
      color = trimmed.replace('Color:', '').trim();
    } else if (trimmed.startsWith('Soil:')) {
      soilLevel = trimmed.replace('Soil:', '').trim();
    } else if (trimmed.startsWith('Care:')) {
      const careItems = trimmed.replace('Care:', '').split(',').map((c) => c.trim()).filter(Boolean);
      specialCare.push(...careItems);
    } else {
      otherLines.push(line);
    }
  }

  return {
    customerNotes: otherLines.join('\n').trim(),
    color,
    soilLevel,
    specialCare,
  };
}

/**
 * Combines vehicle details with customer notes for storage in appointments.notes
 */
export function buildVehicleNotes(params: {
  customerNotes?: string;
  color?: string;
  soilLevel?: string;
  specialCare?: string[];
}): string {
  const parts: string[] = [];
  if (params.color) parts.push(`Color: ${params.color}`);
  if (params.soilLevel) parts.push(`Soil: ${params.soilLevel}`);
  if (params.specialCare && params.specialCare.length > 0) {
    parts.push(`Care: ${params.specialCare.join(', ')}`);
  }
  if (params.customerNotes && params.customerNotes.trim()) {
    parts.push(params.customerNotes.trim());
  }
  return parts.join('\n');
}
