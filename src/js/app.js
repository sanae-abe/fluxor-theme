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

// スクロールアニメーション（[data-animate-grid] 共通処理）
;(function initGridAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.15 })

  document.querySelectorAll('[data-animate-grid]').forEach(function (el) {
    observer.observe(el)
  })
})()

// Shopify Inbox チャットアイコンのサイズを調整
;(function initInboxIconSize() {
  const CSS = `
    button.chat-toggle svg {
      width: 40px !important;
      height: 40px !important;
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

  function injectAll() {
    document.querySelectorAll('inbox-online-store-chat').forEach(inject)
  }

  ;[0, 500, 1500, 3000].forEach(delay => setTimeout(injectAll, delay))

  const observer = new MutationObserver(injectAll)
  observer.observe(document.body, { childList: true, subtree: true })
})()

// フローティングカートバーとチャットアイコンの重なりを防ぐ
;(function initChatOffset() {
  const bar = document.getElementById('floating-cart-bar')
  if (!bar) return

  function updateOffset() {
    const chatEl = document.querySelector('inbox-online-store-chat')
    const shadow = chatEl?.shadowRoot
    if (!shadow) return

    let style = shadow.querySelector('#inbox-offset-style')
    if (!style) {
      style = document.createElement('style')
      style.id = 'inbox-offset-style'
      shadow.appendChild(style)
    }

    if (bar.classList.contains('is-visible')) {
      const height = bar.getBoundingClientRect().height
      style.textContent = `:host { bottom: ${height}px !important; transition: bottom 0.3s ease !important; }`
    } else {
      style.textContent = ''
    }
  }

  new MutationObserver(updateOffset).observe(bar, {
    attributes: true,
    attributeFilter: ['class'],
  })
})()
