import { formatJPY, centsToYen } from '../utils/money.js'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

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

  toggle() {
    this.open = !this.open
  },

  formatPrice(cents) {
    return formatJPY(centsToYen(cents))
  },

  imageUrl(url, width) {
    if (!url) return ''
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
