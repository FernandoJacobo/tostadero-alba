/**
 * Utilidades de horario compartidas por "Abierto ahora", la tabla de horarios y el formulario de reservación.
 * Funcionan igual en el build (Node) y en el navegador.
 */
import { formatTime, type DayKey, type OpeningSlot } from '@/config/site';

export type Hours = Record<DayKey, readonly OpeningSlot[]>;

/** Índice de Date.getDay() (0 = domingo) → clave de site.hours */
export const dayKeys: DayKey[] = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];

const dayNames: Record<DayKey, string> = {
  lun: 'el lunes',
  mar: 'el martes',
  mie: 'el miércoles',
  jue: 'el jueves',
  vie: 'el viernes',
  sab: 'el sábado',
  dom: 'el domingo',
};

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const fromMinutes = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** Día de la semana, minutos desde medianoche y fecha "AAAA-MM-DD" en la zona horaria del negocio. */
export function nowIn(tz: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const dayIdx = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return {
    dayIdx,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
    isoDate: `${get('year')}-${get('month')}-${get('day')}`,
  };
}

export function openStatus(hours: Hours, tz: string, date = new Date()) {
  const { dayIdx, minutes } = nowIn(tz, date);
  const today = hours[dayKeys[dayIdx]] ?? [];
  const current = today.find((s) => minutes >= toMinutes(s.open) && minutes < toMinutes(s.close));
  if (current) return { open: true, label: `Abierto ahora · Cierra a las ${formatTime(current.close)}` };

  const laterToday = today.find((s) => minutes < toMinutes(s.open));
  if (laterToday) return { open: false, label: `Cerrado · Abre hoy a las ${formatTime(laterToday.open)}` };

  for (let i = 1; i <= 7; i++) {
    const key = dayKeys[(dayIdx + i) % 7];
    const slot = hours[key]?.[0];
    if (slot) return { open: false, label: `Cerrado · Abre ${i === 1 ? 'mañana' : dayNames[key]} a las ${formatTime(slot.open)}` };
  }
  return { open: false, label: 'Cerrado temporalmente' };
}

/** Horarios disponibles para reservar en un día: cada `step` minutos, hasta `beforeClose` minutos antes de cerrar. */
export function bookingSlots(slots: readonly OpeningSlot[], step: number, beforeClose: number) {
  const out: string[] = [];
  for (const s of slots) {
    for (let m = toMinutes(s.open); m <= toMinutes(s.close) - beforeClose; m += step) out.push(fromMinutes(m));
  }
  return out;
}
