export const ingredientFilters = () => ({
  articles: [],
  selectedProducts: [],
  selectedCategories: [],
  selectedConcerns: [],
  sortBy: 'title-asc',
  mobileOpen: false,
  _filteredIds: [],
  _order: {},
  filteredCount: 0,

  init() {
    const el = document.getElementById('ingredient-data');
    if (el) this.articles = JSON.parse(el.textContent);
    this._refilter();
    this.$watch('selectedProducts',   () => this._refilter());
    this.$watch('selectedCategories', () => this._refilter());
    this.$watch('selectedConcerns',   () => this._refilter());
    this.$watch('sortBy',             () => this._refilter());
  },

  _refilter() {
    const sp  = this.selectedProducts;
    const sc  = this.selectedCategories;
    const sco = this.selectedConcerns;
    const sortFns = {
      'title-asc':  (a, b) => (a.inci_name || a.title).localeCompare(b.inci_name || b.title, 'en'),
      'title-desc': (a, b) => (b.inci_name || b.title).localeCompare(a.inci_name || a.title, 'en'),
      'newest':     (a, b) => b.date - a.date,
      'oldest':     (a, b) => a.date - b.date,
    };

    const filtered = this.articles
      .filter(a => {
        const productIds = (a.products || []).map(p => p.id);
        if (sp.length  > 0 && !sp.some(id => productIds.includes(id))) return false;
        if (sc.length  > 0 && !sc.some(c => (a.categories || []).includes(c))) return false;
        if (sco.length > 0 && !sco.some(c => (a.concerns   || []).includes(c))) return false;
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

  get uniqueConcerns() {
    return [...new Set(this.articles.flatMap(a => a.concerns || []))];
  },

  get uniqueProducts() {
    const seen = new Set();
    return this.articles.flatMap(a => a.products || []).filter(p => {
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
    return this._filteredIds.includes(idx);
  },

  getOrder(idx) {
    const pos = this._order[idx];
    return pos !== undefined ? pos : 9999;
  },

  toggle(group, value) {
    const map = {
      products:   'selectedProducts',
      categories: 'selectedCategories',
      concerns:   'selectedConcerns',
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
    this.selectedProducts = [];
    this.selectedCategories = [];
    this.selectedConcerns = [];
  },
});
