import '../css/app.css'
import Alpine from 'alpinejs'

import { cartStore }       from './stores/cart.js'
import { saleStore }       from './stores/sale.js'
import { siteHeader }      from './components/header.js'
import { saleCountdown }   from './components/saleCountdown.js'
import { announcementBar } from './components/announcementBar.js'

Alpine.store('cart', cartStore)
Alpine.store('sale', saleStore)
Alpine.data('siteHeader', siteHeader)
Alpine.data('saleCountdown', saleCountdown)
Alpine.data('announcementBar', announcementBar)

document.addEventListener('alpine:init', () => {
  Alpine.store('cart').fetch()
})

window.Alpine = Alpine
Alpine.start()
