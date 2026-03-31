export const announcementBar = (total) => ({
  current: 0,
  total,
  prev() {
    this.current = (this.current - 1 + this.total) % this.total
  },
  next() {
    this.current = (this.current + 1) % this.total
  },
})
