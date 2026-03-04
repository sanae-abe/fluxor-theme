/**
 * Hero Fluxor — Slideshow
 * 自動再生 + ドットナビゲーション
 */

class HeroFluxor extends HTMLElement {
  constructor() {
    super();
    this.slides = Array.from(this.querySelectorAll('.hero-fluxor__slide'));
    this.dots = Array.from(this.querySelectorAll('.hero-fluxor__dot'));
    this.current = 0;
    this.timer = null;
    this.duration = parseInt(this.dataset.duration || '5000', 10);
  }

  connectedCallback() {
    if (this.slides.length <= 1) return;

    this.dots.forEach((dot, i) => {
      dot.addEventListener('click', () => this.goTo(i));
    });

    this.start();

    // ホバー中は一時停止
    this.addEventListener('mouseenter', () => this.pause());
    this.addEventListener('mouseleave', () => this.start());

    // キーボード操作
    this.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }

  disconnectedCallback() {
    this.pause();
  }

  goTo(index) {
    this.slides[this.current].classList.remove('is-active');
    this.dots[this.current]?.classList.remove('is-active');

    this.current = (index + this.slides.length) % this.slides.length;

    this.slides[this.current].classList.add('is-active');
    this.dots[this.current]?.classList.add('is-active');
  }

  next() {
    this.goTo(this.current + 1);
  }

  prev() {
    this.goTo(this.current - 1);
  }

  start() {
    this.pause();
    this.timer = setInterval(() => this.next(), this.duration);
  }

  pause() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

customElements.define('hero-fluxor', HeroFluxor);
