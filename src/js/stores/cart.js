import { formatJPY, centsToYen } from '../utils/money.js'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

const PLACEHOLDER = (() => {
  const svg = '<svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#F5F5F4"/><path d="M98 86L91.828 79.828C91.0779 79.0781 90.0607 78.6569 89 78.6569C87.9393 78.6569 86.9221 79.0781 86.172 79.828L68 98M66 62H94C96.2091 62 98 63.7909 98 66V94C98 96.2091 96.2091 98 94 98H66C63.7909 98 62 96.2091 62 94V66C62 63.7909 63.7909 62 66 62ZM78 74C78 76.2091 76.2091 78 74 78C71.7909 78 70 76.2091 70 74C70 71.7909 71.7909 70 74 70C76.2091 70 78 71.7909 78 74Z" stroke="#D6D3D1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  return `data:image/svg+xml;base64,${btoa(svg)}`
})()

const postJSON = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`)
  return res.json()
}

export const cartStore = {
  open: false,
  loading: false,
  errored: false,
  items: [],
  itemCount: 0,
  placeholder: PLACEHOLDER,

  toggle() {
    this.open = !this.open
  },

  formatPrice(cents) {
    return formatJPY(centsToYen(cents))
  },

  imageUrl(url, width) {
    if (!url) return PLACEHOLDER
    try {
      const u = new URL(url)
      u.searchParams.set('width', width)
      return u.toString()
    } catch {
      return url
    }
  },

  truncate(str, len) {
    if (!str) return ''
    return str.length > len ? str.substring(0, len) + '…' : str
  },

  totalPrice() {
    return this.items.reduce((sum, item) => sum + item.final_line_price, 0)
  },

  _apply(data) {
    this.items = data.items
    this.itemCount = data.item_count
  },

  async add(variantId, quantity = 1) {
    if (this.loading) return
    this.loading = true
    this.errored = false
    try {
      await postJSON('/cart/add.js', { id: variantId, quantity })
      const res = await fetch('/cart.js')
      if (!res.ok) throw new Error(`GET /cart.js failed: ${res.status}`)
      this._apply(await res.json())
      this.open = true
    } catch (err) {
      console.error('[cart.add]', err)
      this.errored = true
    } finally {
      this.loading = false
    }
  },

  async remove(lineItemKey) {
    this.loading = true
    this.errored = false
    try {
      const data = await postJSON('/cart/change.js', { id: lineItemKey, quantity: 0 })
      this._apply(data)
    } catch (err) {
      console.error('[cart.remove]', err)
      this.errored = true
    } finally {
      this.loading = false
    }
  },

  async changeQuantity(lineItemKey, quantity) {
    if (quantity < 0) return
    this.loading = true
    this.errored = false
    try {
      const data = await postJSON('/cart/change.js', { id: lineItemKey, quantity })
      this._apply(data)
    } catch (err) {
      console.error('[cart.changeQuantity]', err)
      this.errored = true
    } finally {
      this.loading = false
    }
  },

  async fetch() {
    this.loading = true
    this.errored = false
    try {
      const res = await fetch('/cart.js')
      if (!res.ok) throw new Error(`GET /cart.js failed: ${res.status}`)
      this._apply(await res.json())
    } catch (err) {
      console.error('[cart.fetch]', err)
      this.errored = true
    } finally {
      this.loading = false
    }
  },
}
