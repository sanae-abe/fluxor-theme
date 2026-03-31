/**
 * 円を日本円フォーマットに変換する
 * @param {number} yen
 * @returns {string} e.g. "¥1,000"
 */
export const formatJPY = (yen) =>
  '¥' + Math.round(yen).toLocaleString('ja-JP')

/**
 * Shopify の cents（1/100円）を円に変換する
 * @param {number} cents
 * @returns {number}
 */
export const centsToYen = (cents) => Math.round(cents / 100)
