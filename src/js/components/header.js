export const siteHeader = () => ({
  mobileMenuOpen: false,
  headerHidden: false,
  lastScrollY: 0,
  announcementHeight: 0,

  get effectiveTop() {
    return Math.max(0, this.announcementHeight - this.lastScrollY)
  },

  init() {
    const bar = document.getElementById('AnnouncementBar')
    this.announcementHeight = bar ? bar.offsetHeight : 0
    this.lastScrollY = window.scrollY

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY
      if (currentScrollY < 80) {
        this.headerHidden = false
      } else if (currentScrollY > this.lastScrollY + 10) {
        this.headerHidden = true
        this.mobileMenuOpen = false
      } else if (currentScrollY < this.lastScrollY - 5) {
        this.headerHidden = false
      }
      this.lastScrollY = currentScrollY
    }, { passive: true })
  },
})
