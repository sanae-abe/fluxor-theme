import { formatJPY } from '../utils/money.js'

export const saleStore = {
  config: window.fluxorSale || { enabled: false },

  isActive() {
    if (!this.config.enabled) return false
    const now = Date.now()
    if (this.config.start) {
      const start = new Date(this.config.start).getTime()
      if (!isNaN(start) && now < start) return false
    }
    if (this.config.end) {
      const end = new Date(this.config.end).getTime()
      if (!isNaN(end) && now > end) return false
    }
    return true
  },

  calcSalePrice(originalPrice, discountPercent) {
    return Math.floor(originalPrice * (100 - discountPercent) / 100)
  },

  formatMoney(yen) {
    return formatJPY(yen)
  },
}
