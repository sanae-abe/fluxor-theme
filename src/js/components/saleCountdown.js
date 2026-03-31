const MS_PER_DAY  = 86_400_000
const MS_PER_HOUR = 3_600_000
const MS_PER_MIN  = 60_000
const MS_PER_SEC  = 1_000

export const saleCountdown = (endDateStr) => ({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  expired: false,
  _timer: null,

  get hh() { return String(this.hours).padStart(2, '0') },
  get mm() { return String(this.minutes).padStart(2, '0') },
  get ss() { return String(this.seconds).padStart(2, '0') },

  init() {
    this.update()
    this._timer = setInterval(() => this.update(), MS_PER_SEC)
  },

  destroy() {
    if (this._timer) clearInterval(this._timer)
  },

  update() {
    const diff = new Date(endDateStr).getTime() - Date.now()
    if (diff <= 0) {
      this.expired = true
      this.days = this.hours = this.minutes = this.seconds = 0
      if (this._timer) clearInterval(this._timer)
      return
    }
    this.days    = Math.floor(diff / MS_PER_DAY)
    this.hours   = Math.floor((diff % MS_PER_DAY)  / MS_PER_HOUR)
    this.minutes = Math.floor((diff % MS_PER_HOUR) / MS_PER_MIN)
    this.seconds = Math.floor((diff % MS_PER_MIN)  / MS_PER_SEC)
  },
})
