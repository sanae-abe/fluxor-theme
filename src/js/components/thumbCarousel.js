export function thumbCarousel(imageCount) {
  return {
    thumbOffset: 0,
    maxOffset: Math.max(0, imageCount - 4),
    _cardW() {
      return (this.$refs.thumbTrack?.querySelector('button')?.offsetWidth ?? 0) + 12;
    },
    scrollPrev() {
      this.thumbOffset = Math.max(0, this.thumbOffset - 1);
      this.$refs.thumbTrack.scrollTo({ left: this.thumbOffset * this._cardW(), behavior: 'smooth' });
    },
    scrollNext() {
      this.thumbOffset = Math.min(this.maxOffset, this.thumbOffset + 1);
      this.$refs.thumbTrack.scrollTo({ left: this.thumbOffset * this._cardW(), behavior: 'smooth' });
    },
    scrollToThumb(index) {
      const t = this.$refs.thumbTrack;
      const thumbs = t.querySelectorAll('button');
      const thumb = thumbs[index];
      if (!thumb) return;
      const cardW = this._cardW();
      if (thumb.offsetLeft < t.scrollLeft) {
        this.thumbOffset = Math.max(0, this.thumbOffset - 1);
        t.scrollTo({ left: this.thumbOffset * cardW, behavior: 'smooth' });
      } else if (thumb.offsetLeft + thumb.offsetWidth > t.scrollLeft + t.clientWidth) {
        this.thumbOffset = Math.min(this.maxOffset, this.thumbOffset + 1);
        t.scrollTo({ left: this.thumbOffset * cardW, behavior: 'smooth' });
      }
    }
  };
}
