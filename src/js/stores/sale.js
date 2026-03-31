import { formatJPY } from '../utils/money.js'

const cfg     = window.fluxorSale || { enabled: false }
const startMs = cfg.start ? new Date(cfg.start).getTime() : null
const endMs   = cfg.end   ? new Date(cfg.end).getTime()   : null

export const saleStore = {
  isActive() {
    if (!cfg.enabled) return false
    const now = Date.now()
    if (startMs !== null && !isNaN(startMs) && now < startMs) return false
    if (endMs   !== null && !isNaN(endMs)   && now > endMs)   return false
    return true
  },

  calcSalePrice(originalPrice, discountPercent) {
    return Math.floor(originalPrice * (100 - discountPercent) / 100)
  },

  formatMoney: formatJPY,
}
