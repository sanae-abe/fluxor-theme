---
name: thumbnail-search
description: Unsplashで無料サムネイル画像を検索しShopify記事に設定する
---

# Thumbnail Search

引数: $ARGUMENTS（例: "skincare serum" ARTICLE_ID）

## 実行フロー

1. $ARGUMENTS を解析する:
   - 第1引数: 検索キーワード（英語推奨）
   - 第2引数: Shopify記事ID（省略可）
   - どちらも空の場合は AskUserQuestion で確認する

2. Bash で検索・設定を実行する:
   ```bash
   set -a && source .env && set +a && node tmp/search-unsplash.mjs "QUERY" ARTICLE_ID
   ```

3. 結果を表示する:
   - 検索ヒット5件のURL・撮影者名・Unsplashページリンク
   - 自動的に1位を選択してShopify記事に設定
   - 帰属表示（Unsplashガイドライン必須）

## 注意事項

- 検索キーワードは英語が推奨（日本語は結果が少ない）
- 自動選択は1位。別の画像にしたい場合はURLを指定して再実行
- Unsplashライセンス: 商用利用可、帰属表示を記事内に記載することを推奨
- APIキー: .env の UNSPLASH_ACCESS_KEY（無料枠: 50リクエスト/時）

## 成分記事向け推奨クエリ例

| 成分 | 推奨クエリ |
|---|---|
| サリチル酸 | `skincare serum` `acne treatment` |
| ヒアルロン酸 | `hyaluronic acid skincare` `moisturizer` |
| ナイアシンアミド | `vitamin skincare` `beauty serum` |
| レチノール | `anti aging skincare` `retinol serum` |
| セラミド | `moisturizing cream skincare` |
