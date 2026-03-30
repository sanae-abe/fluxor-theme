import '../css/app.css'
import Alpine from 'alpinejs'

// ------------------------------------
// Cart Store
// ------------------------------------
Alpine.store('cart', {
  open: false,
  items: [],
  itemCount: 0,

  toggle() {
    this.open = !this.open
  },

  async add(variantId, quantity = 1) {
    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity }),
      })
      if (!res.ok) throw new Error('Cart add failed')
      await this.fetch()
      this.open = true
    } catch (err) {
      console.error('[cart.add]', err)
    }
  },

  async remove(lineItemKey) {
    try {
      const res = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lineItemKey, quantity: 0 }),
      })
      if (!res.ok) throw new Error('Cart remove failed')
      await this.fetch()
    } catch (err) {
      console.error('[cart.remove]', err)
    }
  },

  async fetch() {
    try {
      const res = await fetch('/cart.js')
      const data = await res.json()
      this.items = data.items
      this.itemCount = data.item_count
    } catch (err) {
      console.error('[cart.fetch]', err)
    }
  },
})

// ------------------------------------
// Sale Schedule Store
// ------------------------------------
Alpine.store('sale', {
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
    return '¥' + Math.round(yen).toLocaleString('ja-JP')
  },
})

// ------------------------------------
// Sale Countdown Data
// ------------------------------------
Alpine.data('saleCountdown', (endDateStr) => ({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  expired: false,
  _timer: null,

  init() {
    this.update()
    this._timer = setInterval(() => this.update(), 1000)
  },

  destroy() {
    if (this._timer) clearInterval(this._timer)
  },

  update() {
    const end = new Date(endDateStr).getTime()
    const diff = end - Date.now()
    if (diff <= 0) {
      this.expired = true
      this.days = this.hours = this.minutes = this.seconds = 0
      if (this._timer) clearInterval(this._timer)
      return
    }
    this.days    = Math.floor(diff / 86400000)
    this.hours   = Math.floor((diff % 86400000) / 3600000)
    this.minutes = Math.floor((diff % 3600000) / 60000)
    this.seconds = Math.floor((diff % 60000) / 1000)
  },
}))

// ------------------------------------
// Init
// ------------------------------------
document.addEventListener('alpine:init', () => {
  Alpine.store('cart').fetch()
})

window.Alpine = Alpine
Alpine.start()
