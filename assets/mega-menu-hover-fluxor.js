// ============================================================
// Mega Menu Hover Control — Fluxor
// デスクトップではホバー、モバイルではクリックで動作
// ============================================================

class MegaMenuHover {
  constructor() {
    this.megaMenus = document.querySelectorAll('.mega-menu');
    this.isDesktop = window.matchMedia('(min-width: 990px)').matches;
    this.hoverTimeout = null;

    this.init();
    this.bindEvents();
  }

  init() {
    this.megaMenus.forEach(menu => {
      const summary = menu.querySelector('summary');

      if (this.isDesktop) {
        // デスクトップ: details のデフォルト動作を無効化
        menu.removeAttribute('open');
        if (summary) {
          summary.addEventListener('click', this.preventDefaultClick.bind(this));
        }
      }
    });
  }

  bindEvents() {
    // レスポンシブ対応: 画面サイズ変更時の再初期化
    window.addEventListener('resize', this.debounce(() => {
      const newIsDesktop = window.matchMedia('(min-width: 990px)').matches;
      if (newIsDesktop !== this.isDesktop) {
        this.isDesktop = newIsDesktop;
        this.init();
        this.setupHoverEvents();
      }
    }, 250));

    this.setupHoverEvents();
  }

  setupHoverEvents() {
    this.megaMenus.forEach(menu => {
      // 既存のイベントリスナーをクリア
      menu.removeEventListener('mouseenter', this.handleMouseEnter.bind(this));
      menu.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));

      if (this.isDesktop) {
        // デスクトップ: ホバーイベント
        menu.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        menu.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
      }
    });
  }

  handleMouseEnter(event) {
    if (!this.isDesktop) return;

    const menu = event.currentTarget;

    // ホバー遅延をクリア
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    // 他のメガメニューを閉じる
    this.closeAllMenus();

    // 対象メニューを開く
    menu.setAttribute('open', '');
    menu.classList.add('mega-menu--hovered');
  }

  handleMouseLeave(event) {
    if (!this.isDesktop) return;

    const menu = event.currentTarget;

    // 短い遅延後に閉じる（マウスの細かい動きを無視）
    this.hoverTimeout = setTimeout(() => {
      menu.removeAttribute('open');
      menu.classList.remove('mega-menu--hovered');
    }, 100);
  }

  preventDefaultClick(event) {
    if (this.isDesktop) {
      // デスクトップではクリックを無効化
      event.preventDefault();
      event.stopPropagation();
    }
  }

  closeAllMenus() {
    this.megaMenus.forEach(menu => {
      menu.removeAttribute('open');
      menu.classList.remove('mega-menu--hovered');
    });
  }

  // ユーティリティ: デバウンス
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
  new MegaMenuHover();
});

// Shopify セクションロード時の再初期化（テーマエディター対応）
document.addEventListener('shopify:section:load', (event) => {
  if (event.target.querySelector('.mega-menu')) {
    new MegaMenuHover();
  }
});