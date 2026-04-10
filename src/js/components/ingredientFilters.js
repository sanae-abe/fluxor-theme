const SORT_FNS = {
  'title-asc':  (a, b) => (a.inci_name || a.title).localeCompare(b.inci_name || b.title, 'en'),
  'title-desc': (a, b) => (b.inci_name || b.title).localeCompare(a.inci_name || a.title, 'en'),
  'newest':     (a, b) => b.date - a.date,
  'oldest':     (a, b) => a.date - b.date,
};

const GROUP_KEYS = {
  products:   'selectedProducts',
  categories: 'selectedCategories',
  concerns:   'selectedConcerns',
};

export const ingredientFilters = () => ({
  articles: [],
  selectedProducts: [],
  selectedCategories: [],
  selectedConcerns: [],
  sortBy: 'title-asc',
  mobileOpen: false,
  _order: {},
  filteredCount: 0,

  init() {
    const el = document.getElementById('ingredient-data');
    if (el) this.articles = JSON.parse(el.textContent);
    this._refilter();
    ['selectedProducts', 'selectedCategories', 'selectedConcerns', 'sortBy'].forEach(key =>
      this.$watch(key, () => this._refilter())
    );
  },

  _refilter() {
    const { selectedProducts: sp, selectedCategories: sc, selectedConcerns: sco } = this;

    const filtered = this.articles
      .filter(a => {
        const productIds = (a.products ?? []).map(p => p.id);
        if (sp.length  > 0 && !sp.some(id => productIds.includes(id))) return false;
        if (sc.length  > 0 && !sc.some(c => (a.categories ?? []).includes(c))) return false;
        if (sco.length > 0 && !sco.some(c => (a.concerns   ?? []).includes(c))) return false;
        return true;
      })
      .sort(SORT_FNS[this.sortBy] ?? (() => 0));

    this._order = Object.fromEntries(filtered.map((a, i) => [a.idx, i]));
    this.filteredCount = filtered.length;
  },

  get uniqueCategories() {
    return [...new Set(this.articles.flatMap(a => a.categories ?? []))];
  },

  get uniqueConcerns() {
    return [...new Set(this.articles.flatMap(a => a.concerns ?? []))];
  },

  get uniqueProducts() {
    const seen = new Set();
    return this.articles.flatMap(a => a.products ?? []).filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  },

  get hasActiveFilters() {
    return this.selectedProducts.length > 0 ||
           this.selectedCategories.length > 0 ||
           this.selectedConcerns.length > 0;
  },

  isVisible(idx) {
    return idx in this._order;
  },

  getOrder(idx) {
    return this._order[idx] ?? 9999;
  },

  toggle(group, value) {
    const key = GROUP_KEYS[group];
    const arr = this[key];
    this[key] = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
  },

  clearAll() {
    this.selectedProducts = [];
    this.selectedCategories = [];
    this.selectedConcerns = [];
  },
});
