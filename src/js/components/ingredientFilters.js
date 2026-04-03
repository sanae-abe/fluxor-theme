export const ingredientFilters = () => ({
  articles: [],
  selectedProducts: [],
  selectedCategories: [],
  selectedConcerns: [],
  sortBy: 'title-asc',
  mobileOpen: false,

  init() {
    const el = document.getElementById('ingredient-data');
    if (el) this.articles = JSON.parse(el.textContent);
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

  get filteredAndSorted() {
    const sortFns = {
      'title-asc':  (a, b) => (a.inci_name || a.title).localeCompare(b.inci_name || b.title, 'en'),
      'title-desc': (a, b) => (b.inci_name || b.title).localeCompare(a.inci_name || a.title, 'en'),
      'newest':     (a, b) => b.date - a.date,
      'oldest':     (a, b) => a.date - b.date,
    };

    return this.articles
      .filter(a => {
        const productIds = (a.products || []).map(p => p.id);
        if (this.selectedProducts.length > 0 && !this.selectedProducts.some(id => productIds.includes(id))) return false;
        if (this.selectedCategories.length > 0 && !this.selectedCategories.some(c => (a.categories || []).includes(c))) return false;
        if (this.selectedConcerns.length > 0 && !this.selectedConcerns.some(c => (a.concerns || []).includes(c))) return false;
        return true;
      })
      .sort(sortFns[this.sortBy] ?? (() => 0));
  },

  get filteredCount() {
    return this.filteredAndSorted.length;
  },

  get hasActiveFilters() {
    return this.selectedProducts.length > 0 ||
           this.selectedCategories.length > 0 ||
           this.selectedConcerns.length > 0;
  },

  isVisible(idx) {
    return this.filteredAndSorted.some(a => a.idx === idx);
  },

  getOrder(idx) {
    const HIDDEN_ORDER = 9999;
    const pos = this.filteredAndSorted.findIndex(a => a.idx === idx);
    return pos === -1 ? HIDDEN_ORDER : pos;
  },

  toggle(group, value) {
    const map = {
      products:   'selectedProducts',
      categories: 'selectedCategories',
      concerns:   'selectedConcerns',
    };
    const arr = this[map[group]];
    const i = arr.indexOf(value);
    if (i === -1) arr.push(value);
    else arr.splice(i, 1);
  },

  clearAll() {
    this.selectedProducts = [];
    this.selectedCategories = [];
    this.selectedConcerns = [];
  },
});
