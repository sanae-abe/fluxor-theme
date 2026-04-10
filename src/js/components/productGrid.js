export const productGrid = (initialNextUrl) => ({
  nextUrl: initialNextUrl,
  loading: false,
  errored: false,
  get done() {
    return !this.nextUrl
  },
  init() {
    if (!window.matchMedia('(max-width: 767px)').matches) return
    if (this.done) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) this.loadMore()
      },
      { rootMargin: '400px' }
    )
    obs.observe(this.$refs.sentinel)
  },
  async loadMore() {
    if (this.loading || this.done || !this.nextUrl) return
    this.loading = true
    this.errored = false
    try {
      const res = await fetch(this.nextUrl)
      const html = await res.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const grid = doc.querySelector('[data-product-grid]')
      if (grid) [...grid.children].forEach((el) => this.$refs.grid.appendChild(el))
      const marker = doc.getElementById('js-next-url')
      this.nextUrl = marker ? marker.dataset.url : null
    } catch {
      this.errored = true
    }
    this.loading = false
  },
})
