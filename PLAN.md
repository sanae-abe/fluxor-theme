# Fluxor Theme V2 — 実装計画書

## 概要

Shopify Dawn を使わず、Tailwind CSS + Alpine.js で完全にカスタムビルドする新テーマ。

---

## 技術スタック

| 項目 | 採用 |
|------|------|
| CSS フレームワーク | Tailwind CSS v3（PostCSS ビルド） |
| JavaScript | Alpine.js v3 |
| Shopify | OS2.0（JSON テンプレート） |
| ビルドツール | Vite（Tailwind + JS バンドル） |
| レビュー | Judge.me |

---

## デザイントークン

### カラー（現テーマから引き継ぎ）

| トークン名 | hex | 用途 |
|-----------|-----|------|
| `warm-white` | `#F6F4F0` | メイン背景 |
| `sand` | `#EAE7E1` | セカンダリ背景・カード |
| `black` | `#1A1714` | メインテキスト・ボタン |
| `deep-black` | `#0F0D0B` | ヘッダー・フッター背景 |
| `botanical` | `#2A3B35` | アクセントカラー |

### タイポグラフィ（修正済み）

| 役割 | フォント | 読み込み |
|------|---------|---------|
| 見出し・本文（Latin） | **Outfit** | Google Fonts |
| 日本語 | **Noto Sans JP** | Google Fonts |

```js
// tailwind.config.js
fontFamily: {
  sans: ['Outfit', 'Noto Sans JP', 'sans-serif'],
}
```

---

## ディレクトリ構造

```
fluxor-theme-v2/
├── assets/                   # ビルド済みCSS・JS・画像
│   ├── app.css               # Tailwind コンパイル出力
│   └── app.js                # Alpine.js バンドル出力
├── config/
│   ├── settings_data.json    # テーマ設定値
│   └── settings_schema.json  # テーマエディタ設定定義
├── layout/
│   └── theme.liquid          # 全ページ共通レイアウト
├── locales/
│   └── ja.default.json       # 日本語翻訳
├── sections/                 # セクション一覧（後述）
├── snippets/                 # 再利用コンポーネント（後述）
├── templates/                # ページテンプレート（後述）
├── src/
│   ├── css/
│   │   └── app.css           # Tailwind エントリポイント
│   └── js/
│       └── app.js            # Alpine.js エントリポイント
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## テンプレート一覧

| テンプレート | ファイル | 対応ページ |
|-------------|---------|-----------|
| ホーム | `templates/index.json` | トップページ |
| 商品ページ | `templates/product.json` | 商品詳細 |
| コレクション | `templates/collection.json` | 商品一覧 |
| カート | `templates/cart.json` | カートページ（ドロワー補完） |
| About | `templates/page.about.json` | About ページ |
| 成分ガイド | `templates/blog.ingredients.json` | ブログ（成分ガイドカテゴリ） |
| JOURNAL | `templates/blog.json` | ブログ一覧 |
| 記事 | `templates/article.json` | ブログ記事 |
| お問い合わせ | `templates/page.contact.json` | お問い合わせ |
| プライバシー | `templates/page.json` | 汎用ページ |
| 特定商取引 | `templates/page.json` | 汎用ページ |
| 404 | `templates/404.json` | エラーページ |

---

## セクション一覧

| セクション | ファイル | 備考 |
|-----------|---------|------|
| ヘッダー | `sections/header.liquid` | ナビ・カートアイコン・ハンバーガー |
| フッター | `sections/footer.liquid` | リンク・SNS・コピーライト |
| カートドロワー | `sections/cart-drawer.liquid` | 右スライドイン（Alpine.js） |
| ホームヒーロー | `sections/hero.liquid` | フルスクリーン or ハーフ |
| 商品グリッド | `sections/featured-collection.liquid` | コレクション選択可 |
| メイン商品 | `sections/main-product.liquid` | 画像ギャラリー・購入フォーム |
| メインコレクション | `sections/main-collection.liquid` | フィルター・グリッド |
| メインカート | `sections/main-cart.liquid` | カートページ本体 |
| ブログ一覧 | `sections/main-blog.liquid` | JOURNAL・成分ガイド共用 |
| 記事詳細 | `sections/main-article.liquid` | 記事本文 |
| 汎用ページ | `sections/main-page.liquid` | About・法的ページ等 |
| お問い合わせ | `sections/main-contact.liquid` | Shopify Contact Form |
| テキスト+画像 | `sections/text-with-image.liquid` | About 等で使用 |
| リッチテキスト | `sections/rich-text.liquid` | 汎用テキストブロック |

---

## スニペット一覧

| スニペット | ファイル | 内容 |
|-----------|---------|------|
| 商品カード | `snippets/card-product.liquid` | 画像・タイトル・価格・バッジ |
| 価格 | `snippets/price.liquid` | 税込み表示・セール対応 |
| ブログカード | `snippets/card-article.liquid` | 記事サムネイル・タイトル・日付 |
| アイコン | `snippets/icon.liquid` | SVGインライン（name引数で切替） |
| ページネーション | `snippets/pagination.liquid` | コレクション・ブログ共用 |

---

## カートドロワー設計（Alpine.js）

```js
// app.js
Alpine.store('cart', {
  open: false,
  items: [],
  itemCount: 0,

  toggle() { this.open = !this.open },
  async add(variantId, quantity) { /* Shopify Cart API */ },
  async remove(lineItemKey) { /* Shopify Cart API */ },
  async fetch() { /* GET /cart.js */ },
})
```

- ヘッダーのカートアイコンクリック → `$store.cart.toggle()`
- 「カートに追加」ボタン → `$store.cart.add()` → 自動オープン
- ドロワー外クリック・ESC → クローズ

---

## 実装フェーズ

### Phase 1 — 環境構築（最初に完結させる）
- [ ] npm 初期化・依存インストール（Tailwind, Alpine.js, Vite）
- [ ] `tailwind.config.js`（カラー・フォント設定）
- [ ] `vite.config.js`（CSS+JS ビルド設定）
- [ ] `src/css/app.css`（Tailwind ディレクティブ）
- [ ] `src/js/app.js`（Alpine.js 初期化 + cart store）
- [ ] `npm run dev` スクリプト（Vite watch + shopify theme dev）

### Phase 2 — 基盤 Liquid
- [ ] `layout/theme.liquid`（フォント・CSS・JS・header・footer）
- [ ] `sections/header.liquid`
- [ ] `sections/footer.liquid`
- [ ] `sections/cart-drawer.liquid`
- [ ] `locales/ja.default.json`
- [ ] `config/settings_schema.json`・`settings_data.json`

### Phase 3 — 商品ページ（最重要）
- [ ] `snippets/price.liquid`（税込み表示）
- [ ] `snippets/icon.liquid`
- [ ] `sections/main-product.liquid`（ギャラリー・フォーム・Judge.me）
- [ ] `templates/product.json`

### Phase 4 — コレクション・カート
- [ ] `snippets/card-product.liquid`
- [ ] `sections/main-collection.liquid`
- [ ] `templates/collection.json`
- [ ] `sections/main-cart.liquid`
- [ ] `templates/cart.json`

### Phase 5 — ホーム
- [ ] `sections/hero.liquid`
- [ ] `sections/featured-collection.liquid`
- [ ] `templates/index.json`

### Phase 6 — ブログ・成分ガイド
- [ ] `snippets/card-article.liquid`
- [ ] `sections/main-blog.liquid`
- [ ] `sections/main-article.liquid`
- [ ] `templates/blog.json`・`blog.ingredients.json`・`article.json`

### Phase 7 — 静的ページ群
- [ ] `sections/main-page.liquid`
- [ ] `sections/main-contact.liquid`
- [ ] `templates/page.about.json`・`page.contact.json`・`page.json`・`404.json`

---

## 開発コマンド

```bash
# 開発（Vite watch + Shopify プレビュー同時起動）
npm run dev

# ビルドのみ
npm run build

# Shopify 管理画面へ未公開テーマとしてアップロード
npx shopify theme push --unpublished

# Shopify プレビュー起動のみ
npx shopify theme dev
```

---

## 未決定事項

- [ ] ホームページのセクション構成（Figma デザインを参照）
- [ ] ナビゲーションの構造（メニュー項目）
- [ ] 商品ページのギャラリーレイアウト（メイン+サムネイル or スクロール型）
