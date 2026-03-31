import { formatJPY, centsToYen } from '../utils/money.js'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

const postJSON = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`)
}

export const cartStore = {
  open: false,
  items: [],
  itemCount: 0,

  toggle() {
    this.open = !this.open
  },

  formatPrice(cents) {
    return formatJPY(centsToYen(cents))
  },

  totalPrice() {
    return this.items.reduce((sum, item) => sum + item.final_line_price, 0)
  },

  async add(variantId, quantity = 1) {
    try {
      await postJSON('/cart/add.js', { id: variantId, quantity })
      await this.fetch()
      this.open = true
    } catch (err) {
      console.error('[cart.add]', err)
    }
  },

  async remove(lineItemKey) {
    try {
      await postJSON('/cart/change.js', { id: lineItemKey, quantity: 0 })
      await this.fetch()
    } catch (err) {
      console.error('[cart.remove]', err)
    }
  },

  async fetch() {
    try {
      const res = await fetch('/cart.js')
      if (!res.ok) throw new Error(`GET /cart.js failed: ${res.status}`)
      const data = await res.json()
      this.items = data.items
      this.itemCount = data.item_count
    } catch (err) {
      console.error('[cart.fetch]', err)
    }
  },
}
