/**
 * "YYYY-MM-DD HH:MM" 形式の日本時間文字列を Date オブジェクトに変換する。
 * space を T に置換し +09:00 を付与して ISO 8601 準拠にする。
 */
export const parseJSTDate = (str) => {
  if (!str) return null
  const normalized = str.trim().replace(' ', 'T') + '+09:00'
  const ms = new Date(normalized).getTime()
  return isNaN(ms) ? null : ms
}
