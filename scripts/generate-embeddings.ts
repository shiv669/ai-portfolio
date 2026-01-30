// Generate embeddings for all portfolio chunks
// Run this script when portfolio data changes:
// npx tsx scripts/generate-embeddings.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

import { google } from '@ai-sdk/google'
import { embed } from 'ai'
import { chunks } from '../lib/rag/chunks'
import * as fs from 'fs'
import * as path from 'path'

async function generateEmbeddings() {
    console.log(`Generating embeddings for ${chunks.length} chunks...`)

    const embeddings: Record<string, number[]> = {}

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]

        try {
            const { embedding } = await embed({
                model: google.textEmbeddingModel('text-embedding-004'),
                value: chunk.text
            })

            embeddings[chunk.id] = embedding
            console.log(`[${i + 1}/${chunks.length}] ✓ ${chunk.id} (${embedding.length} dims)`)

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
            console.error(`[${i + 1}/${chunks.length}] ✗ ${chunk.id}: ${error}`)
        }
    }

    // Save to JSON file
    const outputPath = path.join(__dirname, '../lib/rag/embeddings.json')
    fs.writeFileSync(outputPath, JSON.stringify(embeddings, null, 2))

    console.log(`\n✓ Saved ${Object.keys(embeddings).length} embeddings to ${outputPath}`)
}

generateEmbeddings().catch(console.error)
