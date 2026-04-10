import { parseJSTDate } from '../utils/date.js'

const MS_PER_DAY  = 86_400_000
const MS_PER_HOUR = 3_600_000
const MS_PER_MIN  = 60_000
const MS_PER_SEC  = 1_000

const pad = (n) => String(n).padStart(2, '0')

export const saleCountdown = (endDateStr) => ({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  expired: false,
  _timer: null,
  _end: null,

  get hh() { return pad(this.hours) },
  get mm() { return pad(this.minutes) },
  get ss() { return pad(this.seconds) },

  init() {
    this._end = parseJSTDate(endDateStr)
    if (this._end === null) { this.expired = true; return }
    this.update()
    if (!this.expired) {
      this._timer = setInterval(() => this.update(), MS_PER_SEC)
    }
  },

  destroy() {
    clearInterval(this._timer)
    this._timer = null
  },

  _expire() {
    this.days = this.hours = this.minutes = this.seconds = 0
    this.expired = true
    this.destroy()
  },

  update() {
    const diff = this._end - Date.now()
    if (diff <= 0) { this._expire(); return }
    this.days    = Math.floor(diff / MS_PER_DAY)
    this.hours   = Math.floor((diff % MS_PER_DAY)  / MS_PER_HOUR)
    this.minutes = Math.floor((diff % MS_PER_HOUR) / MS_PER_MIN)
    this.seconds = Math.floor((diff % MS_PER_MIN)  / MS_PER_SEC)
  },
})
