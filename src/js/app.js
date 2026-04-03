import '../css/app.css'
import Alpine from 'alpinejs'
import Focus from '@alpinejs/focus'

import { cartStore }       from './stores/cart.js'
import { saleStore }       from './stores/sale.js'
import { siteHeader }      from './components/header.js'
import { saleCountdown }   from './components/saleCountdown.js'
import { announcementBar }   from './components/announcementBar.js'
import { ingredientFilters } from './components/ingredientFilters.js'

Alpine.plugin(Focus)
Alpine.store('cart', cartStore)
Alpine.store('sale', saleStore)
Alpine.store('ui', { announcementHeight: 0 })
Alpine.data('siteHeader', siteHeader)
Alpine.data('saleCountdown', saleCountdown)
Alpine.data('announcementBar', announcementBar)
Alpine.data('ingredientFilters', ingredientFilters)

document.addEventListener('alpine:init', () => {
  Alpine.store('cart').fetch()
})

window.Alpine = Alpine
Alpine.start()

// Shopify Inbox チャットアイコンのサイズを調整
;(function initInboxIconSize() {
  const CSS = `
    button.chat-toggle svg,
    button.chat-toggle.chat-toggle--icon-button.icon-only svg,
    button.chat-toggle.chat-toggle--icon-button.mobile-only svg {
      width: 40px !important;
      height: 40px !important;
    }
  `

  function inject() {
    const chatEl = document.querySelector('inbox-online-store-chat')
    const shadow = chatEl?.shadowRoot
    if (!shadow || shadow.querySelector('#inbox-custom-style')) return
    const style = document.createElement('style')
    style.id = 'inbox-custom-style'
    style.textContent = CSS
    shadow.appendChild(style)
  }

  ;[0, 500, 1500, 3000].forEach(delay => setTimeout(inject, delay))
})()
