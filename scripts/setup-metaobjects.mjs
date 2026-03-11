#!/usr/bin/env node
/**
 * Shopify メタオブジェクト・メタフィールド セットアップスクリプト
 *
 * 実行方法:
 *   SHOPIFY_STORE=your-store.myshopify.com SHOPIFY_TOKEN=your-token node scripts/setup-metaobjects.mjs
 *
 * 事前準備:
 *   管理画面 → 設定 → アプリと販売チャネル → アプリを開発
 *   → カスタムアプリを作成 → APIスコープ: write_metaobjects を設定
 *   → インストール後に Admin API アクセストークンを取得
 */

const STORE = process.env.SHOPIFY_STORE
const TOKEN = process.env.SHOPIFY_TOKEN

if (!STORE || !TOKEN) {
  console.error('エラー: 環境変数が未設定です。')
  console.error('Usage: SHOPIFY_STORE=xxx.myshopify.com SHOPIFY_TOKEN=xxx node scripts/setup-metaobjects.mjs')
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

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = await res.json()
  if (json.errors) {
    throw new Error(`GraphQL エラー: ${JSON.stringify(json.errors, null, 2)}`)
  }
  return json.data
}

// ─────────────────────────────────────────────
// Step 1: メタオブジェクト定義を作成
// ─────────────────────────────────────────────
console.log('\n─── Step 1: メタオブジェクト定義（成分）を作成 ───')

const data = await graphql(`
  mutation MetaobjectDefinitionCreate($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) {
      metaobjectDefinition {
        id
        name
        type
      }
      userErrors {
        field
        message
      }
    }
  }
`, {
  definition: {
    name: '成分',
    type: 'ingredient',
    displayNameKey: 'name',
    fieldDefinitions: [
      {
        name: '成分名',
        key: 'name',
        type: 'single_line_text_field',
      },
      {
        name: 'INCI名',
        key: 'inci_name',
        type: 'single_line_text_field',
      },
      {
        name: 'カテゴリ',
        key: 'category',
        type: 'single_line_text_field',
      },
      {
        name: '説明文',
        key: 'description',
        type: 'multi_line_text_field',
      },
      {
        name: '特徴（改行区切り）',
        key: 'feature',
        type: 'multi_line_text_field',
      },
      {
        name: '画像',
        key: 'image',
        type: 'file_reference',
        validations: [
          { name: 'file_type_options', value: '["Image"]' },
        ],
      },
    ],
  },
})

const moErrors = data.metaobjectDefinitionCreate.userErrors
if (moErrors.length > 0) {
  // type重複はすでに存在するので続行
  const alreadyExists = moErrors.some(e => e.message.includes('taken') || e.message.includes('already'))
  if (alreadyExists) {
    console.log('  ℹ️  メタオブジェクト定義はすでに存在します。スキップします。')
  } else {
    console.error('  エラー:', moErrors)
    process.exit(1)
  }
}

let metaobjectDefinitionId = data.metaobjectDefinitionCreate.metaobjectDefinition?.id

// 既存定義のIDを取得（すでに存在する場合）
if (!metaobjectDefinitionId) {
  console.log('  既存の定義IDを取得中...')
  const existing = await graphql(`
    query {
      metaobjectDefinitionByType(type: "ingredient") {
        id
        name
        type
      }
    }
  `)
  metaobjectDefinitionId = existing.metaobjectDefinitionByType?.id
  if (!metaobjectDefinitionId) {
    console.error('  エラー: 定義IDを取得できませんでした。')
    process.exit(1)
  }
  console.log(`  ✓ 既存定義を確認 (ID: ${metaobjectDefinitionId})`)
} else {
  console.log(`  ✓ 作成完了 (ID: ${metaobjectDefinitionId})`)
}

// ─────────────────────────────────────────────
// Step 2: 製品メタフィールド定義を作成
// ─────────────────────────────────────────────
console.log('\n─── Step 2: 製品メタフィールド定義（custom.ingredients）を作成 ───')

const mfData = await graphql(`
  mutation MetafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
        name
        namespace
        key
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`, {
  definition: {
    name: '成分リスト',
    namespace: 'custom',
    key: 'ingredients',
    type: 'list.metaobject_reference',
    ownerType: 'PRODUCT',
    validations: [
      { name: 'metaobject_definition_id', value: metaobjectDefinitionId },
    ],
  },
})

const mfErrors = mfData.metafieldDefinitionCreate.userErrors
if (mfErrors.length > 0) {
  const alreadyExists = mfErrors.some(e =>
    e.message.includes('taken') || e.message.includes('already') || e.code === 'TAKEN'
  )
  if (alreadyExists) {
    console.log('  ℹ️  メタフィールド定義はすでに存在します。スキップします。')
  } else {
    console.error('  エラー:', mfErrors)
    process.exit(1)
  }
} else {
  const def = mfData.metafieldDefinitionCreate.createdDefinition
  console.log(`  ✓ 作成完了: ${def.namespace}.${def.key} (ID: ${def.id})`)
}

// ─────────────────────────────────────────────
// 完了メッセージ
// ─────────────────────────────────────────────
console.log(`
────────────────────────────────────────
  セットアップ完了！
────────────────────────────────────────

次のステップ:
  1. 管理画面 → コンテンツ → メタオブジェクト → 成分
     → 成分データを1件ずつ入力（Retinol、Niacinamide など）

  2. 各製品の編集画面 → 下部「カスタムフィールド」
     → 成分リストに成分を紐づける

  3. テーマエディタ → 製品ページ
     → + ブロックを追加 → 「成分（メタオブジェクト）」を追加

`)
