export const randomIngredient = (sectionId) => ({
  articles: [],
  article: null,

  init() {
    const el = document.getElementById(`random-ingredient-data-${sectionId}`);
    if (!el) return;
    try {
      this.articles = JSON.parse(el.textContent);
    } catch {
      return;
    }
    if (this.articles.length === 0) return;
    const idx = Math.floor(Math.random() * this.articles.length);
    this.article = this.articles[idx];
  },
});
