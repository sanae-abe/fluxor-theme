# コーディング規約

## Liquid コメント

HTML コメント `<!-- -->` は使用禁止。ブラウザの HTML ソースに出力されるため。

```liquid
{%- comment %} 正しい例 {%- endcomment %}
<!-- 禁止 -->
```

## CSS — カスタムスタイルの配置

| 種別 | 配置先 |
|------|--------|
| テーマ固有カスタム CSS | `src/css/theme.css` |
| 外部サービス override | `src/css/vendors/<service>.css` |
| Tailwind ユーティリティ追加 | `src/css/app.css` の `@layer utilities` |

スニペットやセクション内の `<style>` ブロックは禁止。
スニペットは複数回 render されるため、`<style>` を書くと DOM に同じスタイルが繰り返し注入される。

```liquid
{%- comment %} 禁止例 {%- endcomment %}
<style>
  .btn-card-add { ... }
</style>

{%- comment %} 正しい例：src/css/theme.css に記述してビルド {%- endcomment %}
```

## CSS — ビルド

CSS を変更したら必ず `npm run build` を実行して `assets/app.css` に反映する。

```bash
npm run build
```

ビルド後の出力サイズを確認して想定外の増加がないかチェックすること。

## CSS — ホバーエフェクト

`:hover` は `@media (any-hover: hover)` で囲む（タッチデバイス対応）。

```css
@media (any-hover: hover) {
  .btn:hover { background-color: #fff; }
}
```

## Liquid — render タグ

`render` タグはスコープが分離される。必要な変数はすべてパラメータで渡す。

```liquid
{%- comment %} 外側の変数は render 内から見えない {%- endcomment %}
{%- render 'button', label: btn_label, url: btn_url, variant: 'outline' -%}
```

## Liquid — 空白制御

タグ前後の空白・改行は `{%-` `-%}` で除去する（特にループ・条件分岐）。

```liquid
{%- for block in section.blocks -%}
  ...
{%- endfor -%}
```

## 画像

Shopify CDN の `image_url` フィルタを使い、適切な `width` を指定する。
`loading="lazy"` を設定し、first image のみ `loading="eager" fetchpriority="high"` にする。

```liquid
<img
  src="{{ product.featured_image | image_url: width: 600 }}"
  width="600"
  height="600"
  loading="lazy"
>
```

## スキーマ

各セクションの `{% schema %}` は JSON で記述し、`"default"` 値を設定する。
エディタでプレビューできるよう `"presets"` を必ず含める。
