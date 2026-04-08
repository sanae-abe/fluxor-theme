# Fluxor Theme v2 — プロジェクト設定

## 技術スタック

Shopify Liquid + Alpine.js 3 + Tailwind CSS v3 + Vite 6

## ビルド

CSS を変更したら必ず実行:
```bash
npm run build
```
エントリー: `src/js/app.js` → 出力: `assets/app.js`, `assets/app.css`

## ディレクトリ構造

```
sections/          # セクション（ページ構成単位）
snippets/          # 再利用コンポーネント（render タグで呼び出す）
assets/            # ビルド済みファイル（直接編集禁止）
src/
  js/app.js        # JS エントリーポイント
  css/
    app.css        # CSS エントリーポイント（@import + @tailwind のみ）
    theme.css      # テーマ固有カスタム CSS
    vendors/
      jdgm.css     # Judge.me ウィジェット override
```

## CSS 構成

`src/css/app.css` の import 順:
1. `./vendors/jdgm.css` — 外部サービス override
2. `./theme.css` — テーマ固有スタイル
3. `@tailwind base / components / utilities`

Vite が `@import` をネイティブ処理するため `postcss-import` は不要。

カスタム CSS の配置先:
- テーマ固有 → `src/css/theme.css`
- 外部サービス → `src/css/vendors/<service>.css`
- Tailwind ユーティリティ追加 → `src/css/app.css` の `@layer utilities`

## Alpine.js パターン

グローバルストア:
```javascript
await $store.cart.add(variantId)
```

スニペット内コンポーネント:
```html
<article x-data="{ adding: false, async addToCart() { ... } }">
```

## Shopify Liquid 重要事項

### render タグのスコープ分離

`render` タグはスコープが完全に分離される。外側の変数は**渡さない限りアクセス不可**。

```liquid
{%- render 'button', label: '購入', url: product.url -%}
```

### capture パターン

動的コンテンツを含むスニペットには `capture` + `render` を使う:
```liquid
{%- capture custom_label -%}
  {{ product.title }} — {{ variant.title }}
{%- endcapture -%}
{%- render 'snippet', label: custom_label -%}
```

### コメント

HTML コメント `<!-- -->` は**禁止**。ブラウザに送信される。
```liquid
{%- comment %} Liquid コメントを使う {%- endcomment %}
```

## Shopify Admin API

認証情報は `.env` に記載:
- `SHOPIFY_TOKEN` — Admin API アクセストークン
- `SHOPIFY_STORE` — ストアドメイン（`fluxor-test.myshopify.com`）
- エンドポイント: `https://{SHOPIFY_STORE}/admin/api/2025-01/graphql.json`

### ネストされた article_reference は Liquid で解決不可

ネストされたメタオブジェクト（例: `key_ingredient` の `article` フィールド）の
`article_reference` 型は Liquid でオブジェクトとして解決されない。

```liquid
{{ key_ingredient.article.url }}  {%- comment %} → 空になる {%- endcomment %}
```

GID 文字列（`gid://shopify/Article/...`）が返るだけで、`url` や `handle` にアクセスできない。

**解決策**: Admin API で記事URLを取得し、`url` 型フィールドに別途保存する。

### url 型メタフィールドは絶対 URL 必須

`url` 型フィールドは `https://` スキームが必要。相対パス（`/blogs/...`）は保存不可。

### key_ingredient メタオブジェクト構成

定義ID: `gid://shopify/MetaobjectDefinition/15877308615`

| フィールド    | 型                  | 備考                                       |
|-------------|---------------------|--------------------------------------------|
| article     | article_reference   | Liquid で解決不可 → `article_url` を使う   |
| article_url | single_line_text    | 記事の相対パス（例: `/blogs/ingredients/niacinamide`）|
| description | multi_line_text     |                                            |
| display_name | single_line_text   |                                            |
| ingredient  | single_line_text    |                                            |
| amount      | single_line_text    |                                            |
| thumbnail   | file_reference      |                                            |

## Tailwind CSS

設定: `tailwind.config.js`
カスタムカラーは CSS 変数で定義し `@layer base` に記述する（変数一覧: `src/css/app.css` `:root`）。

| 変数 | 用途 | 値 |
|------|------|-----|
| `--color-background` | ページ背景 | stone-50 |
| `--color-surface` | カード背景 | stone-100 |
| `--color-muted` | ボーダー等 | stone-200 |
| `--color-text` | 本文 | stone-900 |
| `--color-text-muted` | サブテキスト | stone-500 |
| `--color-text-subtle` | ラベル等 | stone-400 |
| `--color-dark` | フッター背景 | stone-900 |
| `--color-accent` | ブランドカラー | `#0f766e` (teal-700) |
| `--color-sale` | セール・割引バッジ | `#be123c` (rose-700) |
