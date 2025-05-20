import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Converts a timestamp string in "dd/MM/yy - HH:mm:ss" format to a Date object
function parseTimestamp(timestamp: string) {
  if (!timestamp) return null;

  try {
    const [datePart, timePart] = timestamp.split(' - ');

    if (!datePart) return null;

    const [day, month, yearShort] = datePart.split('/');

    if (!day || !month || !yearShort) return null;

    const year = `20${yearShort}`;
    const dateString = timePart
      ? `${year}-${month}-${day}T${timePart}`
      : `${year}-${month}-${day}`;
    const date = new Date(dateString);

    return isNaN(date.getTime()) ? null : date;
  } catch (err) {
    return null;
  }
}

/**
 * Unified function to process and format timestamps
 *
 * @param timestamp - Timestamp in "dd/MM/yy - HH:mm:ss" format
 * @param type - Desired formatting type
 * @returns Formatted string according to type and date
 */
export function formatTimestamp(
  timestamp: string,
  type: 'short' | 'label' | 'dynamic'
) {
  /**
   * - 'short': Displays only the time in "HH:mm" format.
   *
   * - 'label': Displays a relative or explicit date label.
   *   - Today → "Hoje"
   *   - Yesterday → "Ontem"
   *   - Within the last 7 days → weekday name
   *   - Older → full date in "dd/MM/yy" format
   *
   * - 'dynamic': Adapts format based on how recent the timestamp is.
   *   - Today → time only (same as 'short' type)
   *   - Yesterday → "Ontem"
   *   - Within the last 7 days → weekday name
   *   - Older → full date in "dd/MM/yy" format
   */

  if (type === 'short') {
    if (!timestamp) return format(new Date(), 'HH:mm');

    try {
      const [_, timePart] = timestamp.split(' - ');

      if (!timePart) return format(new Date(), 'HH:mm');

      const [hour, minute] = timePart.split(':');

      if (!hour || !minute) return format(new Date(), 'HH:mm');

      return `${hour}:${minute}`;
    } catch (err) {
      return format(new Date(), 'HH:mm');
    }
  }

  const date = parseTimestamp(timestamp);

  if (!date) {
    return type === 'dynamic' ? '' : 'Hoje';
  }

  if (isToday(date)) {
    return type === 'dynamic' ? format(date, 'HH:mm') : 'Hoje';
  } else if (isYesterday(date)) {
    return 'Ontem';
  } else if (
    new Date().getTime() - date.getTime() <
    7 * 24 * 60 * 60 * 1000 /* 7 days  in milliseconds */
  ) {
    return format(date, 'EEEE', { locale: ptBR });
  } else {
    return format(date, 'dd/MM/yy');
  }
}

/**
 * Calcula a idade em anos a partir de uma data de nascimento
 *
 * @param birthDate - Data de nascimento como string ou objeto Date
 * @returns Idade em anos
 */
export function calculateAge(birthDate: string | Date | undefined): number {
  if (!birthDate) return 0;

  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;

  // Verifica se a data é válida
  if (isNaN(birth.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  // Ajusta a idade se ainda não fez aniversário este ano
  const birthMonth = birth.getMonth();
  const currentMonth = today.getMonth();

  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}
