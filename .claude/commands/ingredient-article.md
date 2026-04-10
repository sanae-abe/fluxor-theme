---
name: ingredient-article
description: 成分ガイド記事を生成してShopifyに直接作成する
---

# Ingredient Article Generator

対象成分: $ARGUMENTS

## 実行フロー

1. $ARGUMENTS が空の場合、AskUserQuestion で成分名を確認する
2. `sections/main-ingredient-article.liquid` を Read してフィールド構造を確認する
3. WebFetch で cosmetic-info.jp からINCIを取得する:
   ```
   URL: https://www.cosmetic-info.jp/jcln/result.php?nameOp=cn&name={URLエンコードした成分名}&-f=name&-d=asc&-r=20&-p=1
   ```
   - 取得できた場合: そのINCIをそのまま `inci_name` に使用する
   - 見つからない場合: 科学的知識から生成し「⚠️ INCI未確認」と明記する
4. Bash で NCBI E-utilities API を使い PubMed 論文を収集する（**コンテンツ生成より先に実行**）:
   - 検索クエリ例（INCI英語名を使用）:
     - `"[INCI名] skin"`
     - `"[INCI名] skincare moisturizing"`
     - `"[INCI名] skin barrier"`
     - `"[INCI名] anti-inflammatory wound healing"`
   - 各クエリ上位5件、合計20件程度を取得
   - PMC あり優先・成分に直接関連するものを優先して **4件を選定**
   - 選定した4件の書誌情報（title / authors / journal / volume / issue / pages / pubdate / pmid / pmc）を確定する
5. 選定した論文を参考文献として、成分の科学的知識を基にすべてのフィールドコンテンツを生成する:
   - reference_entries は手順4で確定した論文情報をそのまま使用（URLも確定済み）
   - roles・body_html の記述は選定論文が対象とする研究内容に即して書く
6. 生成したデータを `tmp/article-data.json` に Write する
7. Bash で Shopify に記事を作成する:
   ```bash
   set -a && source .env && set +a && node tmp/create-ingredient-article.mjs
   ```
8. 作成された記事IDを取得し、Unsplashでサムネイルを検索・設定する:
   ```bash
   set -a && source .env && set +a && node tmp/search-unsplash.mjs "ENGLISH_QUERY" ARTICLE_ID
   ```
   クエリは成分の英語名または用途（例: `salicylic acid skincare`、`moisturizing serum`）

## コンテンツ生成規則

### 記事タイトル
「[成分名]とは？スキンケアでの役割と使い方」を基本フォーマットとし、40〜60文字以内でロングテールキーワードを含める。
例: 「サリチル酸とは？スキンケア成分としての役割と毛穴・ニキビへのアプローチ」

### custom.inci_name
cosmetic-info.jp の表示名称データベースで確認した値を優先する。各単語の先頭のみ大文字（例: Melaleuca Alternifolia (Tea Tree) Leaf Extract）。

### 記事抜粋（excerpt）
120〜150文字。記事一覧での表示用。メタディスクリプションにも同じ内容を使用する。

### custom.category_tags（最大2つ）
- ビタミン類
- 保湿・バリア成分
- ペプチド・アミノ酸類
- 植物エキス・オイル
- 先端・その他の成分

### custom.skin_concerns（最大4つ、合理的な理由があるもののみ）
- エイジングケア
- くすみ・透明感
- 乾燥・うるおい
- 毛穴・肌キメ
- ニキビ・肌荒れ

### 記事本文（body_html）
200〜400文字。HTMLの `<p>` タグで囲む。
成分の化学的性質・代謝経路・スキンケア成分としての位置づけを教育的に説明する。

**引用形式**: 論文に基づく記述の句読点の直前に、半角スペース + `[n]` の形式で引用番号を挿入する。
- 複数論文が根拠の場合: `[1, 2]`
- 引用番号は `reference_entries` の配列順（1始まり）に対応する
- 例: `…チロシナーゼへの競合的な作用が知られています [4]。`
- 一般的な化学構造の説明など、特定論文に帰属しない記述には引用不要

### custom.roles（3〜5項目）
各 role（型: `role`）:
- title: 〜へのアプローチ・〜への作用など
- description: 研究・文献に基づく説明（80〜120文字）。論文に基づく記述の句読点直前に `[n]` 形式の引用番号を挿入する（body_html と同じ形式）。
- icon: Lucideアイコン名（refresh-cw / layers / shield / droplets / sparkles / sun / leaf / zap など）

### custom.usage_tips（4〜6項目）
各 content_item（型: `content_item`）:
- title: ポイントのタイトル
- description: 具体的な説明（80〜150文字）。論文に基づく記述の句読点直前に `[n]` 形式の引用番号を挿入する。

### custom.compatible_ingredients（3〜5項目）
各 ingredient_combination（型: `ingredient_combination`）:
- name: 成分名
- reason: 相性が良い理由（60〜120文字）。論文に基づく記述の句読点直前に `[n]` 形式の引用番号を挿入する。

### custom.caution_combinations（2〜4項目）
各 ingredient_combination（型: `ingredient_combination`）:
- name: 成分名
- reason: 注意すべき理由（60〜120文字）。論文に基づく記述の句読点直前に `[n]` 形式の引用番号を挿入する。

### custom.pregnancy_note
100〜150文字。妊娠・授乳中の安全性に関する注意喚起。
「使用を控えることを推奨」または「皮膚科専門医に相談」のいずれかで締める。

### custom.reference_entries（4件）
手順4のPubMed検索で確定した論文を使用する。LLMの知識から論文タイトルを生成しない。

各 reference_entry（型: `reference_entry`）:
- title: 論文タイトル（英語・PubMed取得値そのまま）
- authors: 著者名。形式:
  - 1〜2名: 全員列挙（et al. 不要）
  - 3名以上: 筆頭著者のみ + `, et al.`
- journal: 掲載誌名（PubMed の fulljournalname）
- details: 発行年; 巻(号): ページ（PubMed の pubdate / volume / issue / pages から構成）
- url: PMC URL優先（`https://www.ncbi.nlm.nih.gov/pmc/articles/PMCID/`）、PMCなしはPubMed URL（`https://pubmed.ncbi.nlm.nih.gov/PMID/`）
- accessed_on: PMC URL のみ当日日付、PubMed URLは空文字

## 薬機法遵守ルール（必ず守ること）

### 禁止表現
- 「〜を改善する」「〜を治す」「〜に効く」「〜を消す」「〜を減らす」
- 「〜%の人に効果があった」「臨床試験で証明された」
- 「医薬品的な作用」を断定する表現
- 「しわ・シミの改善」（医薬部外品表示のみ可能）

### 使用する表現
- 「〜が研究で報告されています」「〜が文献で検討されています」
- 「〜への作用が知られています」「〜の可能性があるとされています」
- 「〜をサポートします」「〜に働きかけます」

## 参考文献と本文の整合性ルール

- 各参考文献が何を対象とした研究か明確にする
- 本文中の具体的な数値は、引用した論文に記載がある場合のみ使用する
- 出典が特定できない数値は記載しない
- body_html / roles / usage_tips / compatible_ingredients / caution_combinations のすべてにおいて、論文に基づく記述には必ず引用番号 `[n]` を付ける（上記「記事本文」の引用形式を参照）
- 「文献で検討されており」「研究で報告されています」などの表現がある場合は必ず対応する引用番号を付与する

## JSON出力形式（tmp/article-data.json）

```json
{
  "title": "成分名",
  "inci_name": "Ingredient Name",
  "excerpt": "記事抜粋...",
  "body_html": "<p>本文...（論文に基づく記述には [n] 形式の引用番号を句読点直前に挿入）...</p>",
  "category_tags": ["タグ1"],
  "skin_concerns": ["タグ1", "タグ2"],
  "pregnancy_note": "妊娠中の注意...",
  "roles": [
    { "title": "〇〇へのアプローチ", "description": "〇〇...", "icon": "refresh-cw" }
  ],
  "usage_tips": [
    { "title": "〇〇", "description": "〇〇..." }
  ],
  "compatible_ingredients": [
    { "name": "〇〇", "reason": "〇〇..." }
  ],
  "caution_combinations": [
    { "name": "〇〇", "reason": "〇〇..." }
  ],
  "reference_entries": [
    {
      "title": "Paper title in English",
      "authors": "Author A, et al.",
      "journal": "Journal Name",
      "details": "2024; 10(1): 1–10",
      "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMCxxxxxxx/",
      "accessed_on": "2026-04-06"
    }
  ]
}
```

## PubMed 論文不足時の対応

成分によっては論文が4件未満の場合がある:
- 3件しか見つからない場合: 3件で reference_entries を構成する（無理に4件にしない）
- 直接関連する論文がない場合: 含有成分・代謝産物・類縁成分の論文で代替し、その旨をユーザーに伝える
- LLMの知識から論文タイトルを生成することは禁止

## 実行後の出力

- 作成された記事の管理画面URL
- 選定した参考文献とカバーするroleの対応表
- 薬機法チェックポイント確認表
