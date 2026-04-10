export const journalFilters = () => ({
  articles: [],
  selectedCategories: [],
  selectedTags: [],
  sortBy: 'newest',
  mobileOpen: false,
  _filteredIds: [],
  _order: {},
  filteredCount: 0,

  init() {
    const el = document.getElementById('journal-articles-data');
    if (el) this.articles = JSON.parse(el.textContent);
    this._refilter();
    this.$watch('selectedCategories', () => this._refilter());
    this.$watch('selectedTags',   () => this._refilter());
    this.$watch('sortBy',             () => this._refilter());
  },

  _refilter() {
    const sc  = this.selectedCategories;
    const st = this.selectedTags;
    const sortFns = {
      'newest':     (a, b) => b.date - a.date,
      'oldest':     (a, b) => a.date - b.date,
      'title-asc':  (a, b) => a.title.localeCompare(b.title, 'ja'),
      'title-desc': (a, b) => b.title.localeCompare(a.title, 'ja'),
    };

    const filtered = this.articles
      .filter(a => {
        if (sc.length  > 0 && !sc.some(c => (a.categories || []).includes(c))) return false;
        if (st.length > 0 && !st.some(c => (a.tags   || []).includes(c))) return false;
        return true;
      })
      .sort(sortFns[this.sortBy] ?? (() => 0));

    this._filteredIds = filtered.map(a => a.idx);
    this._order = Object.fromEntries(filtered.map((a, i) => [a.idx, i]));
    this.filteredCount = filtered.length;
  },

  get uniqueCategories() {
    return [...new Set(this.articles.flatMap(a => a.categories || []))];
  },

  get uniqueTags() {
    return [...new Set(this.articles.flatMap(a => a.tags || []))];
  },

  get hasActiveFilters() {
    return this.selectedCategories.length > 0 || this.selectedTags.length > 0;
  },

  isVisible(idx) {
    return this._filteredIds.includes(idx);
  },

  getOrder(idx) {
    const pos = this._order[idx];
    return pos !== undefined ? pos : 9999;
  },

  toggle(group, value) {
    const map = {
      categories: 'selectedCategories',
      tags:   'selectedTags',
    };
    const key = map[group];
    const i = this[key].indexOf(value);
    if (i === -1) {
      this[key] = [...this[key], value];
    } else {
      this[key] = this[key].filter((_, j) => j !== i);
    }
  },

  clearAll() {
    this.selectedCategories = [];
    this.selectedTags   = [];
  },
});
