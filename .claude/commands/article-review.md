---
name: article-review
description: Review scientific/skincare articles for citation consistency, accuracy, and reference quality
---

# Article Review

Review the article provided in $ARGUMENTS or in the conversation for scientific accuracy and citation integrity.

## Execution Flow

1. Parse input from $ARGUMENTS (file path or article text in conversation)
2. If file path provided: Read the file
3. Run all review checks in parallel
4. Output structured findings by category

## Review Checklist

### 1. Citation Consistency

**In-text vs reference list cross-check:**

Build two lists:
- List A: All citation numbers used in the body text (e.g., [1], [2, 3], [5, 6])
- List B: All reference numbers in the reference list

Report:
- Citations in List A but not in List B → "本文で引用されているが参考文献リストに存在しない: [N]"
- References in List B but not in List A → "参考文献リストに存在するが本文で引用されていない: [N]"

### 2. Citation Quality Check

For each cited reference, verify:

**In vitro vs in vivo distinction:**
- If reference is a cell culture study (in vitro), check that body text uses appropriate hedging
- Required language: "細胞実験では", "in vitroの研究では"
- Flag if body text implies human skin evidence without this caveat

**Review paper vs primary paper:**
- If a review/systematic review is cited for a specific quantitative claim (e.g., "11倍速い"), flag it
- Recommend citing the original primary paper when available
- If primary papers are available in the reference list, prefer those over review papers for specific claims

**Age of evidence:**
- Flag studies older than 20 years if cited as sole support for a key claim
- Note if all references are from a single era (e.g., all 1999 studies)

### 3. Uncited Claims Check

Scan for claim types that require citations but lack them:

- Specific numeric values (e.g., "11倍", "18週間", "0.05%〜0.1%")
- Mechanistic claims ("〜を抑制する", "〜を産生する", "〜に作用する")
- Comparative statements ("レチノイン酸と比べて")
- Safety/tolerability statements ("忍容性が良好", "妊娠中は推奨されない")
- Duration claims ("4〜8週間で効果を実感")

For each uncited claim, report: claim text → recommended citation type needed

### 4. Scientific Accuracy Check

Verify common facts in the article domain:

**For retinoid/skincare articles:**
- Retinol conversion pathway: retinol → retinaldehyde → retinoic acid (2 steps for retinol, 1 for retinal)
- EU/US ban on retinoic acid in cosmetics: accurate
- Niacinamide does not cause flushing (unlike niacin): accurate
- SPF recommendation for retinoid users: SPF30+ is standard guidance

**General checks:**
- Internal consistency: same claim should not contradict itself across sections
- Ingredient combination safety claims should be directionally consistent with literature
- Pregnancy warnings should be conservative (err on side of caution)

### 5. Reference Format Check

Verify each reference entry contains:
- Author(s): Last name, Initials
- Journal name
- Year
- Volume(Issue): pages

Flag incomplete entries.

**Author format consistency (most important):**

Standard: 筆頭著者 + et al. (e.g., `Tanno O, et al.`)
- Single author or 2 authors: list all (no et al. needed)
- 3+ authors: first author only + `, et al.`
- Organization as author (e.g., AAD): list as-is

Flag these inconsistencies within the same reference list:
- Varying number of authors before "et al." (e.g., 1 author in some, 6 in others)
- Missing comma before "et al." (e.g., `Smith B et al.` → should be `Smith B, et al.`)

## Output Format

Structure output as:

```
## レビュー結果

### 重大な問題
[Issues that must be fixed before publication]

### 引用の整合性
| # | 参考文献 | 本文引用 | 判定 |
|---|---------|---------|------|
...

### 未引用の主張
[Claims that need citations, with specific text]

### 引用品質
[In vitro/review paper concerns]

### 科学的正確性
[Accuracy issues if any]

### 参考文献フォーマット
[Author format inconsistencies, missing fields]

### 総評
[Overall assessment: 公開可能 / 要修正 / 要大幅修正]
```

If no issues found in a section, write "問題なし" for that section.

## Argument Handling

Parse $ARGUMENTS:
- If empty: review article text provided in the conversation
- If file path (starts with / or ~): read the file, then review
- If text: treat as article content directly

If no article provided in arguments or conversation: ask user to provide the article text or file path.

## Error Handling

If file path not found: report "ファイルが見つかりません: [path]"
If article text too short (< 100 characters): ask user to provide complete article

## Examples

/article-review → Review article text provided in the current conversation
/article-review ~/articles/retinal.md → Review article from file
/article-review "この成分について..." → Review article text provided as argument
