import type {
  MaintenanceType,
  ExpenseCategory,
  FuelType,
  Transmission,
  ReminderPriority,
} from '@/types';

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  oil_change: 'Cambio de aceite',
  tire_rotation: 'Rotación de neumáticos',
  brake_service: 'Service de frenos',
  tune_up: 'Afinación',
  inspection: 'Inspección',
  repair: 'Reparación',
  other: 'Otro',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  fuel: 'Combustible',
  maintenance: 'Mantenimiento',
  insurance: 'Seguro',
  registration: 'Patente/Registro',
  repair: 'Reparación',
  parking: 'Estacionamiento',
  tolls: 'Peajes',
  other: 'Otro',
};

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  gasoline: 'Nafta',
  diesel: 'Diesel',
  electric: 'Eléctrico',
  hybrid: 'Híbrido',
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  manual: 'Manual',
  automatic: 'Automático',
  cvt: 'CVT',
};

export const REMINDER_PRIORITY_LABELS: Record<ReminderPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

export const REMINDER_PRIORITY_COLORS: Record<ReminderPriority, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};
