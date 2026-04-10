export const randomIngredient = (sectionId) => ({
  article: null,

  init() {
    const el = document.getElementById(`random-ingredient-data-${sectionId}`);
    if (!el) return;
    let articles;
    try {
      articles = JSON.parse(el.textContent);
    } catch {
      return;
    }
    if (articles.length === 0) return;
    this.article = articles[Math.floor(Math.random() * articles.length)];
  },
});
