class CategoryNavCarousel extends HTMLElement {
  connectedCallback() {
    this.grid = this.querySelector('.category-nav-fluxor__grid');
    this.btnPrev = this.querySelector('.category-nav-fluxor__btn--prev');
    this.btnNext = this.querySelector('.category-nav-fluxor__btn--next');

    if (!this.grid || !this.btnPrev || !this.btnNext) return;

    this.btnPrev.addEventListener('click', () => this.scrollBy(-1));
    this.btnNext.addEventListener('click', () => this.scrollBy(1));
    this.grid.addEventListener('scroll', () => this.updateButtons(), { passive: true });

    new ResizeObserver(() => this.updateButtons()).observe(this.grid);

    this.updateButtons();
  }

  scrollBy(direction) {
    const item = this.grid.querySelector('.category-nav-fluxor__item');
    if (!item) return;
    const gap = parseFloat(getComputedStyle(this.grid).columnGap) || 0;
    const scrollAmount = (item.offsetWidth + gap) * 2;
    this.grid.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }

  updateButtons() {
    const { scrollLeft, scrollWidth, clientWidth } = this.grid;
    const atStart = scrollLeft <= 1;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;

    this.btnPrev.setAttribute('aria-hidden', String(atStart));
    this.btnNext.setAttribute('aria-hidden', String(atEnd));
  }
}

customElements.define('category-nav-carousel', CategoryNavCarousel);
