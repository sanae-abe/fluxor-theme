#!/usr/bin/env node
/**
 * 製品-成分 紐づけスクリプト
 *
 * 実行方法:
 *   SHOPIFY_STORE=your-store.myshopify.com SHOPIFY_TOKEN=xxx node scripts/link-product-ingredients.mjs
 *
 * CSVファイル: scripts/data/product-ingredients.csv
 * カラム:
 *   product_handle: 製品のハンドル（URLの末尾部分）
 *   ingredient_handles: 成分のハンドルをカンマ区切り（ダブルクォートで囲む）
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STORE = process.env.SHOPIFY_STORE
const TOKEN = process.env.SHOPIFY_TOKEN

if (!STORE || !TOKEN) {
  console.error('エラー: 環境変数が未設定です。')
  console.error('Usage: SHOPIFY_STORE=xxx.myshopify.com SHOPIFY_TOKEN=xxx node scripts/link-product-ingredients.mjs')
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

// 製品ハンドルからGIDを取得
async function getProductId(handle) {
  const data = await graphql(`
    query GetProduct($handle: String!) {
      productByHandle(handle: $handle) { id title }
    }
  `, { handle })
  return data.productByHandle ?? null
}

// 成分ハンドルからGIDを取得
async function getIngredientId(handle) {
  const data = await graphql(`
    query GetMetaobject($handle: MetaobjectHandleInput!) {
      metaobjectByHandle(handle: $handle) { id handle }
    }
  `, { handle: { type: 'ingredient', handle } })
  return data.metaobjectByHandle ?? null
}

// 製品メタフィールドを更新
async function setIngredients(productId, ingredientIds) {
  const data = await graphql(`
    mutation ProductUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id }
        userErrors { field message }
      }
    }
  `, {
    input: {
      id: productId,
      metafields: [{
        namespace: 'custom',
        key: 'ingredients',
        type: 'list.metaobject_reference',
        value: JSON.stringify(ingredientIds),
      }],
    },
  })
  return data.productUpdate.userErrors
}

// ─── メイン処理 ───────────────────────────────
const csvPath = resolve(__dirname, 'data/product-ingredients.csv')
let csvText
try {
  csvText = readFileSync(csvPath, 'utf-8')
} catch {
  console.error(`エラー: CSVファイルが見つかりません: ${csvPath}`)
  process.exit(1)
}

const rows = parseCSV(csvText)
console.log(`\n${rows.length} 件の製品データを読み込みました。`)
console.log('─────────────────────────────────────\n')

let success = 0
let failed = 0

for (const row of rows) {
  if (!row.product_handle) { failed++; continue }

  const ingredientHandles = row.ingredient_handles
    .split(',')
    .map(h => h.trim())
    .filter(Boolean)

  if (ingredientHandles.length === 0) {
    console.warn(`  ! スキップ（成分未指定）: ${row.product_handle}`)
    continue
  }

  // 製品IDを取得
  const product = await getProductId(row.product_handle)
  if (!product) {
    console.error(`  ✗ 製品が見つかりません: ${row.product_handle}`)
    failed++
    continue
  }

  // 各成分IDを取得
  const ingredientIds = []
  for (const handle of ingredientHandles) {
    const mo = await getIngredientId(handle)
    if (!mo) {
      console.warn(`    ! 成分が見つかりません: ${handle}（スキップ）`)
    } else {
      ingredientIds.push(mo.id)
    }
  }

  if (ingredientIds.length === 0) {
    console.error(`  ✗ 有効な成分がゼロ: ${row.product_handle}`)
    failed++
    continue
  }

  // メタフィールドを更新
  const errors = await setIngredients(product.id, ingredientIds)
  if (errors.length > 0) {
    console.error(`  ✗ 失敗: ${product.title} — ${errors.map(e => e.message).join(', ')}`)
    failed++
  } else {
    console.log(`  ✓ 紐づけ完了: ${product.title}（成分 ${ingredientIds.length}件）`)
    success++
  }
}

console.log(`
─────────────────────────────────────
完了: 成功 ${success}件 / 失敗 ${failed}件
`)

if (failed === 0) {
  console.log('次のステップ:')
  console.log('  テーマエディタ → 製品ページ → 「成分（メタオブジェクト）」ブロックを追加\n')
}
