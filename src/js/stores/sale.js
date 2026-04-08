import { formatJPY } from '../utils/money.js'
import { parseJSTDate } from '../utils/date.js'

const cfg = window.fluxorSale || { enabled: false }

const startMs = parseJSTDate(cfg.start)
const endMs = parseJSTDate(cfg.end)

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
