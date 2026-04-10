const SORT_FNS = {
  'newest':     (a, b) => b.date - a.date,
  'oldest':     (a, b) => a.date - b.date,
  'title-asc':  (a, b) => a.title.localeCompare(b.title, 'ja'),
  'title-desc': (a, b) => b.title.localeCompare(a.title, 'ja'),
};

export const journalFilters = () => ({
  articles: [],
  selectedCategories: [],
  selectedTags: [],
  sortBy: 'newest',
  mobileOpen: false,
  _order: {},
  filteredCount: 0,

  init() {
    const el = document.getElementById('journal-articles-data');
    if (el) this.articles = JSON.parse(el.textContent);
    this._refilter();
    ['selectedCategories', 'selectedTags', 'sortBy'].forEach(key =>
      this.$watch(key, () => this._refilter())
    );
  },

  _refilter() {
    const { selectedCategories: sc, selectedTags: st } = this;
    const sorted = this.articles
      .filter(a =>
        (sc.length === 0 || sc.some(c => (a.categories ?? []).includes(c))) &&
        (st.length === 0 || st.some(c => (a.tags ?? []).includes(c)))
      )
      .sort(SORT_FNS[this.sortBy] ?? (() => 0));

    this._order = Object.fromEntries(sorted.map((a, i) => [a.idx, i]));
    this.filteredCount = sorted.length;
  },

  get uniqueCategories() {
    return [...new Set(this.articles.flatMap(a => a.categories ?? []))];
  },

  get uniqueTags() {
    return [...new Set(this.articles.flatMap(a => a.tags ?? []))];
  },

  get hasActiveFilters() {
    return this.selectedCategories.length > 0 || this.selectedTags.length > 0;
  },

  isVisible(idx) {
    return idx in this._order;
  },

  getOrder(idx) {
    return this._order[idx] ?? 9999;
  },

  toggle(group, value) {
    const key = group === 'categories' ? 'selectedCategories' : 'selectedTags';
    const arr = this[key];
    this[key] = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
  },

  clearAll() {
    this.selectedCategories = [];
    this.selectedTags = [];
  },
});
