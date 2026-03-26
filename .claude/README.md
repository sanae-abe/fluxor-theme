# Fluxor Theme v2

Shopify Liquid テーマ。日本向けコスメ EC サイト（fluxor）の v2。

## 技術スタック

| 役割 | 技術 |
|------|------|
| テンプレート | Shopify Liquid |
| JS フレームワーク | Alpine.js 3 |
| CSS フレームワーク | Tailwind CSS v3 |
| ビルドツール | Vite 6 |

## コマンド

```bash
npm run build    # 本番ビルド（CSS 変更後は必ず実行）
npm run dev      # ウォッチモード（開発中）
npm run shopify  # Shopify テーマ開発サーバー
```

## CSS ファイル構成

| ファイル | 役割 |
|---------|------|
| `src/css/app.css` | エントリーポイント（@import + @tailwind のみ） |
| `src/css/theme.css` | テーマ固有カスタム CSS |
| `src/css/vendors/jdgm.css` | Judge.me ウィジェット override |

Judge.me を別サービスに移行する場合は `src/css/vendors/jdgm.css` のみ差し替える。
