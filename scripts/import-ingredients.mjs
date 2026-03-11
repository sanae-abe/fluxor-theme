#!/usr/bin/env node
/**
 * 成分 CSVインポートスクリプト
 *
 * 実行方法:
 *   SHOPIFY_STORE=your-store.myshopify.com SHOPIFY_TOKEN=xxx node scripts/import-ingredients.mjs
 *
 * CSVファイル: scripts/data/ingredients.csv
 * カラム: handle, name, inci_name, category, description, benefits
 *   - handle: URL-safe な一意の識別子（例: retinol、niacinamide）
 *   - benefits: 複数の効能は改行区切り（CSVではダブルクォートで囲む）
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STORE = process.env.SHOPIFY_STORE
const TOKEN = process.env.SHOPIFY_TOKEN

if (!STORE || !TOKEN) {
  console.error('エラー: 環境変数が未設定です。')
  console.error('Usage: SHOPIFY_STORE=xxx.myshopify.com SHOPIFY_TOKEN=xxx node scripts/import-ingredients.mjs')
  process.exit(1)
}

const API_URL = `https://${STORE}/admin/api/2025-01/graphql.json`

async function graphql(query, variables = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  const json = await res.json()
  if (json.errors) throw new Error(`GraphQL エラー: ${JSON.stringify(json.errors, null, 2)}`)
  return json.data
}

// ダブルクォート・改行対応のCSVパーサー
function parseCSV(text) {
  const rows = []
  let headers = null
  let i = 0

  function readField() {
    if (text[i] === '"') {
      i++
      let val = ''
      while (i < text.length) {
        if (text[i] === '"' && text[i + 1] === '"') {
          val += '"'; i += 2
        } else if (text[i] === '"') {
          i++; break
        } else {
          val += text[i++]
        }
      }
      return val
    }
    let val = ''
    while (i < text.length && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
      val += text[i++]
    }
    return val.trim()
  }

  while (i < text.length) {
    const fields = []
    while (i < text.length && text[i] !== '\n' && text[i] !== '\r') {
      fields.push(readField())
      if (text[i] === ',') i++
    }
    if (text[i] === '\r') i++
    if (text[i] === '\n') i++
    if (fields.length === 0 || (fields.length === 1 && fields[0] === '')) continue

    if (!headers) {
      headers = fields
    } else {
      const row = {}
      headers.forEach((h, j) => { row[h] = fields[j] ?? '' })
      rows.push(row)
    }
  }
  return rows
}

// ─── メイン処理 ───────────────────────────────
const csvPath = resolve(__dirname, 'data/ingredients.csv')
let csvText
try {
  csvText = readFileSync(csvPath, 'utf-8')
} catch {
  console.error(`エラー: CSVファイルが見つかりません: ${csvPath}`)
  process.exit(1)
}

const rows = parseCSV(csvText)
if (rows.length === 0) {
  console.error('エラー: CSVにデータがありません。')
  process.exit(1)
}

console.log(`\n${rows.length} 件の成分データを読み込みました。`)
console.log('─────────────────────────────────────\n')

let success = 0
let skipped = 0
let failed = 0

for (const row of rows) {
  if (!row.handle || !row.name) {
    console.warn('  ! 行をスキップ（handle または name が空）:', row)
    skipped++
    continue
  }

  const fields = [
    { key: 'name',        value: row.name },
    { key: 'inci_name',   value: row.inci_name },
    { key: 'category',    value: row.category },
    { key: 'description', value: row.description },
    { key: 'feature',     value: row.feature },
    // image は Shopify 管理画面からアップロードが必要なため CSV インポートでは対象外
  ].filter(f => f.value && f.value.trim() !== '')

  const data = await graphql(`
    mutation MetaobjectCreate($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id handle }
        userErrors { field message }
      }
    }
  `, {
    metaobject: { type: 'ingredient', handle: row.handle, fields },
  })

  const errors = data.metaobjectCreate.userErrors
  if (errors.length > 0) {
    const isExisting = errors.some(e =>
      e.message.toLowerCase().includes('taken') ||
      e.message.toLowerCase().includes('already')
    )
    if (isExisting) {
      console.log(`  ℹ  スキップ（既存）: ${row.name}`)
      skipped++
    } else {
      console.error(`  ✗ 失敗: ${row.name} — ${errors.map(e => e.message).join(', ')}`)
      failed++
    }
  } else {
    const obj = data.metaobjectCreate.metaobject
    console.log(`  ✓ 作成: ${row.name} (handle: ${obj.handle})`)
    success++
  }
}

console.log(`
─────────────────────────────────────
完了: 作成 ${success}件 / スキップ ${skipped}件 / 失敗 ${failed}件
`)

if (failed === 0) {
  console.log('次のステップ:')
  console.log('  scripts/data/product-ingredients.csv を編集して製品と成分を紐づける')
  console.log('  node scripts/link-product-ingredients.mjs を実行\n')
}
