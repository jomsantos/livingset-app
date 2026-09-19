import { writeFile } from 'node:fs/promises'
import * as cheerio from 'cheerio'

const sourceUrl = 'https://herohabit.com/topps-baseball-living-set/'
const outputPath = new URL('../src/data/cards.ts', import.meta.url)

const response = await fetch(sourceUrl, {
  headers: { 'user-agent': 'livingset-app checklist updater' },
})

if (!response.ok) {
  throw new Error(`Checklist source returned HTTP ${response.status}`)
}

const html = await response.text()
if (html.includes('Just a moment...') || html.length < 50_000) {
  throw new Error('Checklist source response looks incomplete or blocked')
}

const $ = cheerio.load(html)
const cards = []

$('table').each((_, table) => {
  const team = $(table).prevAll('h2, h3').first().text().trim()
  $(table).find('tr').each((__, row) => {
    const values = $(row).find('td').map((___, cell) => $(cell).text().replace(/\s+/g, ' ').trim()).get()
    const id = Number(values[0])
    if (!Number.isInteger(id) || id <= 0) return

    const name = values.slice(1).find((value) => value && value !== 'RC' && !/^\d[\d,]*$/.test(value))
    if (!name) return

    cards.push({
      id,
      name,
      team: team || 'Unknown',
      rookie: values.includes('RC'),
    })
  })
})

const uniqueCards = [...new Map(cards.map((card) => [card.id, card])).values()].sort((a, b) => a.id - b.id)
const maxId = uniqueCards.at(-1)?.id ?? 0
if (uniqueCards.length < 700 || maxId < 700) {
  throw new Error(`Checklist validation failed: found ${uniqueCards.length} cards, max ID ${maxId}`)
}

const generated = `// Generated from ${sourceUrl}\n// Do not edit manually. Run npm run update-cards.\n\nexport type Card = {\n  id: number\n  name: string\n  team: string\n  rookie: boolean\n}\n\nexport const cards: Card[] = ${JSON.stringify(uniqueCards, null, 2)}\n`
await writeFile(outputPath, generated)
console.log(`Updated ${uniqueCards.length} cards through card ${maxId}`)
