export const siteHeader = () => ({
  mobileMenuOpen: false,
  scrolled: false,
  headerTop: 0,
  init() {
    this._updateTop = () => {
      const barHeight = window.Alpine?.store('ui')?.announcementHeight ?? 0
      const scrollY = window.scrollY
      this.headerTop = Math.max(0, barHeight - scrollY)
      this.scrolled = scrollY >= barHeight
    }
    this.$watch('$store.ui.announcementHeight', () => this._updateTop())
    this._onScroll = () => this._updateTop()
    this._updateTop()
    window.addEventListener('scroll', this._onScroll, { passive: true })
  },
  destroy() {
    window.removeEventListener('scroll', this._onScroll)
  }
})
