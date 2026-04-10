export type Severity = 'normal' | 'alert' | 'critical' | 'unfilled';

export interface VitalsData {
  bloodPressure: string | null;
  heartRate: number | null;
  temperature: number | null;
  oxygenSaturation: number | null;
  painLevel: number | null;
  weight: number | null;
}

export function getVitalSeverity(type: keyof VitalsData, value: any): Severity {
  if (value === null || value === undefined) return 'unfilled';

  switch (type) {
    case 'bloodPressure': {
      const parts = value.split('/').map((v: string) => v.trim() === '?' ? null : Number(v));
      const sys = parts[0];
      const dia = parts[1];
      if (!sys || !dia) return 'normal';
      if (sys >= 140 || dia >= 90) return 'critical';
      if (sys >= 130 || dia >= 85) return 'alert';
      return 'normal';
    }
    case 'heartRate': {
      const val = Number(value);
      if (val < 50 || val > 110) return 'critical';
      if (val < 60 || val > 100) return 'alert';
      return 'normal';
    }
    case 'temperature': {
      const val = Number(value);
      if (val > 37.8 || val < 35.5) return 'critical';
      if (val > 37.2 || val < 36.1) return 'alert';
      return 'normal';
    }
    case 'oxygenSaturation': {
      const val = Number(value);
      if (val <= 90) return 'critical';
      if (val <= 94) return 'alert';
      return 'normal';
    }
    case 'painLevel': {
      const val = Number(value);
      if (val >= 8) return 'critical';
      if (val >= 4) return 'alert';
      return 'normal';
    }
    case 'weight':
      return 'normal';
    default:
      return 'normal';
  }
}

export function getOverallSeverity(vitals: VitalsData): Severity {
  const severities: Severity[] = [
    getVitalSeverity('bloodPressure', vitals.bloodPressure),
    getVitalSeverity('heartRate', vitals.heartRate),
    getVitalSeverity('temperature', vitals.temperature),
    getVitalSaturationSeverity(vitals.oxygenSaturation),
    getVitalPainSeverity(vitals.painLevel),
  ];

  if (severities.includes('critical')) return 'critical';
  if (severities.includes('alert')) return 'alert';
  return 'normal';
}

// Helper specific for spo2 if needed, but the switch above is more general
function getVitalSaturationSeverity(val: number | null): Severity {
    if (val === null) return 'unfilled';
    if (val <= 90) return 'critical';
    if (val <= 94) return 'alert';
    return 'normal';
}

function getVitalPainSeverity(val: number | null): Severity {
    if (val === null) return 'unfilled';
    if (val >= 8) return 'critical';
    if (val >= 4) return 'alert';
    return 'normal';
}
