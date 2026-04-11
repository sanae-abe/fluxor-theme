export function ingredientCarousel(descIdx) {
  return {
    active: null,
    atStart: true,
    atEnd: false,
    cardW: 0,
    descIdx,
    updateNav() {
      const t = this.$refs.track;
      if (!this.cardW) {
        const card = t.querySelector('.flex-none');
        this.cardW = card ? card.offsetWidth + 8 : 160;
      }
      this.atStart = t.scrollLeft <= 0;
      this.atEnd   = t.scrollLeft >= t.scrollWidth - t.clientWidth - 1;
    },
    scrollToCard(index) {
      const t = this.$refs.track;
      const cards = t.querySelectorAll('.flex-none');
      const card = cards[index];
      if (!card) return;
      const cardLeft  = card.offsetLeft;
      const cardRight = cardLeft + card.offsetWidth;
      const viewLeft  = t.scrollLeft;
      const viewRight = viewLeft + t.clientWidth;
      if (cardLeft < viewLeft) {
        t.scrollTo({ left: t.scrollLeft - this.cardW, behavior: 'smooth' });
      } else if (cardRight > viewRight) {
        t.scrollTo({ left: t.scrollLeft + this.cardW, behavior: 'smooth' });
      }
      this.$nextTick(() => this.updateNav());
    },
    tooltipLeft() {
      if (this.active === null || !this.$refs.track) return 0;
      const cardLeft = this.active * this.cardW - this.$refs.track.scrollLeft;
      return Math.min(Math.max(cardLeft, 0), this.$refs.track.offsetWidth - 288);
    }
  };
}
