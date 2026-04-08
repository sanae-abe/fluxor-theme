export const siteHeader = () => ({
  mobileMenuOpen: false,
  scrolled: false,
  init() {
    this._onScroll = () => {
      const barHeight = window.Alpine?.store('ui')?.announcementHeight ?? 0
      this.scrolled = window.scrollY > barHeight + 10
    }
    window.addEventListener('scroll', this._onScroll, { passive: true })
  },
  destroy() {
    window.removeEventListener('scroll', this._onScroll)
  }
})
