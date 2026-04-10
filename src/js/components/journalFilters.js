export const journalFilters = () => ({
  articles: [],
  selectedCats: [],
  selectedConcerns: [],
  filteredCount: 0,
  catOpen: true,
  concernOpen: true,

  init() {
    const el = document.getElementById('journal-articles-data');
    if (el) this.articles = JSON.parse(el.textContent);
    this._refilter();
    this.$watch('selectedCats',     () => this._refilter());
    this.$watch('selectedConcerns', () => this._refilter());
  },

  _refilter() {
    const sc  = this.selectedCats;
    const sco = this.selectedConcerns;

    const filtered = this.articles.filter(a => {
      if (sc.length  > 0 && !sc.some(c  => (a.tags          || []).includes(c))) return false;
      if (sco.length > 0 && !sco.some(c => (a.skin_concerns || []).includes(c))) return false;
      return true;
    });

    this.filteredCount = filtered.length;
  },

  get hasActiveFilters() {
    return this.selectedCats.length > 0 || this.selectedConcerns.length > 0;
  },

  isVisible(idx) {
    const sc  = this.selectedCats;
    const sco = this.selectedConcerns;
    const a   = this.articles[idx];
    if (!a) return true;
    if (sc.length  > 0 && !sc.some(c  => (a.tags          || []).includes(c))) return false;
    if (sco.length > 0 && !sco.some(c => (a.skin_concerns || []).includes(c))) return false;
    return true;
  },

  clearAll() {
    this.selectedCats     = [];
    this.selectedConcerns = [];
  },
});
