import '../css/app.css'
import Alpine from 'alpinejs'
import Focus from '@alpinejs/focus'

import { cartStore }       from './stores/cart.js'
import { saleStore }       from './stores/sale.js'
import { siteHeader }      from './components/header.js'
import { saleCountdown }   from './components/saleCountdown.js'
import { ingredientFilters }  from './components/ingredientFilters.js'
import { randomIngredient }   from './components/randomIngredient.js'
import { journalFilters }     from './components/journalFilters.js'
import { productGrid }        from './components/productGrid.js'
import { thumbCarousel }      from './components/thumbCarousel.js'
import { ingredientCarousel } from './components/ingredientCarousel.js'

Alpine.plugin(Focus)
Alpine.store('cart', cartStore)
Alpine.store('sale', saleStore)
Alpine.store('ui', { announcementHeight: 0 })
Alpine.data('siteHeader', siteHeader)
Alpine.data('saleCountdown', saleCountdown)
Alpine.data('ingredientFilters', ingredientFilters)
Alpine.data('randomIngredient', randomIngredient)
Alpine.data('journalFilters', journalFilters)
Alpine.data('productGrid', productGrid)
Alpine.data('thumbCarousel', thumbCarousel)
Alpine.data('ingredientCarousel', ingredientCarousel)

document.addEventListener('alpine:init', () => {
  Alpine.store('cart').fetch()
})

window.Alpine = Alpine
Alpine.start()

// Shopify Inbox チャットアイコンのサイズを調整
;(function initInboxIconSize() {
  const CSS = `
    button.chat-toggle svg {
      width: 24px !important;
      height: 24px !important;
    }
  `

  function inject(chatEl) {
    const shadow = chatEl?.shadowRoot
    if (!shadow || shadow.querySelector('#inbox-custom-style')) return
    const style = document.createElement('style')
    style.id = 'inbox-custom-style'
    style.textContent = CSS
    shadow.appendChild(style)
  }

  function injectWithRetry(chatEl) {
    ;[0, 500, 1500, 3000].forEach(delay => setTimeout(() => inject(chatEl), delay))
  }

  const existing = document.querySelector('inbox-online-store-chat')
  if (existing) {
    injectWithRetry(existing)
  } else {
    const observer = new MutationObserver(() => {
      const chatEl = document.querySelector('inbox-online-store-chat')
      if (!chatEl) return
      observer.disconnect()
      injectWithRetry(chatEl)
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }
})()
