/**
 * ONEMANCREW PORTAAL - kleine formatteerhelpers (datum, tijdcode)
 */
var MAANDEN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
}

export function formatDate(value) {
  var date = toDate(value);
  if (!date || isNaN(date.getTime())) return '';
  return date.getDate() + ' ' + MAANDEN[date.getMonth()] + ' ' + date.getFullYear();
}

export function formatTimecode(seconds) {
  var total = Math.max(0, Math.floor(Number(seconds) || 0));
  var m = Math.floor(total / 60);
  var s = total % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

/**
 * Leest "mm:ss" (of enkel "ss") in tot seconden. Geeft null bij ongeldige
 * invoer, zodat de aanroeper zelf een foutmelding kan tonen.
 */
export function parseTimecode(value) {
  var text = String(value == null ? '' : value).trim();
  if (!text) return null;
  var parts = text.split(':');
  if (parts.length > 2) return null;
  var nums = parts.map(function (p) {
    return Number(p);
  });
  if (nums.some(function (n) { return isNaN(n) || n < 0; })) return null;
  var seconds = nums.length === 2 ? nums[0] * 60 + nums[1] : nums[0];
  return Math.max(0, Math.round(seconds));
}
