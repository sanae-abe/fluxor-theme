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
// Init
// ------------------------------------
document.addEventListener('alpine:init', () => {
  Alpine.store('cart').fetch()
})

window.Alpine = Alpine
Alpine.start()
