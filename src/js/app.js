import '../css/app.css'
import Alpine from 'alpinejs'

import { cartStore }       from './stores/cart.js'
import { saleStore }       from './stores/sale.js'
import { siteHeader }      from './components/header.js'
import { saleCountdown }   from './components/saleCountdown.js'
import { announcementBar } from './components/announcementBar.js'

Alpine.store('cart', cartStore)
Alpine.store('sale', saleStore)
Alpine.store('ui', { announcementHeight: 0 })
Alpine.data('siteHeader', siteHeader)
Alpine.data('saleCountdown', saleCountdown)
Alpine.data('announcementBar', announcementBar)

document.addEventListener('alpine:init', () => {
  Alpine.store('cart').fetch()
})

window.Alpine = Alpine
Alpine.start()

// Shopify Inbox チャットバブルを白背景 + 黒アイコン（Lucide message-circle-more）にカスタマイズ
;(function initInboxIconOverride() {
  const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-spec="button-icon"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>'

  const CSS = `
    button {
      background-color: #fff !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18) !important;
    }
  `

  function tryReplace() {
    const chatEl = document.querySelector('inbox-online-store-chat')
    if (!chatEl?.shadowRoot) return false
    const icon = chatEl.shadowRoot.querySelector('[data-spec="button-icon"]')
    if (!icon) return false
    icon.outerHTML = SVG
    const style = document.createElement('style')
    style.textContent = CSS
    chatEl.shadowRoot.appendChild(style)
    return true
  }

  if (tryReplace()) return

  const observer = new MutationObserver(() => {
    if (tryReplace()) observer.disconnect()
  })
  observer.observe(document.body, { childList: true, subtree: true })
})()
