export const siteHeader = () => ({
  mobileMenuOpen: false,
  scrollY: 0,

  get effectiveTop() {
    return Math.max(0, this.$store.ui.announcementHeight - this.scrollY)
  },

  init() {
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY
    }, { passive: true })
  },
})
