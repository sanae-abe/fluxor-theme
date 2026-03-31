import { formatJPY } from '../utils/money.js'

const cfg = window.fluxorSale || { enabled: false }

const parseDate = (str) => {
  if (!str) return null
  const ms = new Date(str).getTime()
  return isNaN(ms) ? null : ms
}

const startMs = parseDate(cfg.start)
const endMs = parseDate(cfg.end)

export const saleStore = {
  isActive() {
    if (!cfg.enabled) return false
    const now = Date.now()
    if (startMs !== null && now < startMs) return false
    if (endMs !== null && now > endMs) return false
    return true
  },

  calcSalePrice(originalPrice, discountPercent) {
    return Math.floor(originalPrice * (100 - discountPercent) / 100)
  },

  formatMoney: formatJPY,
}
