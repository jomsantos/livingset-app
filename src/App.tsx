import { useEffect, useState } from 'react'
import { cards } from './data/cards'

const storageKey = 'living-set-checklist'

function readCompletedCards(): number[] {
  try {
    const stored = window.localStorage.getItem(storageKey)
    const parsed: unknown = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) && parsed.every((id) => typeof id === 'number') ? parsed : []
  } catch {
    return []
  }
}

export default function App() {
  const [completedCards, setCompletedCards] = useState<number[]>(readCompletedCards)
  const completedCount = cards.filter((card) => completedCards.includes(card.id)).length
  const progress = Math.round((completedCount / cards.length) * 100)

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(completedCards))
  }, [completedCards])

  function toggleCard(id: number) {
    setCompletedCards((current) =>
      current.includes(id) ? current.filter((cardId) => cardId !== id) : [...current, id],
    )
  }

  function resetChecklist() {
    setCompletedCards([])
  }

  return (
    <main className="app-shell">
      <section className="checklist-panel" aria-labelledby="page-title">
        <header className="page-header">
          <div>
            <p className="eyebrow">Collection tracker</p>
            <h1 id="page-title">Topps Living Set</h1>
            <p className="intro">Keep a simple record of the cards in your collection.</p>
          </div>
          <div className="progress-mark" aria-label={`${progress}% complete`}>
            <span>{String(progress).padStart(2, '0')}</span>
            <small>% done</small>
          </div>
        </header>

        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="list-heading">
          <span>Your cards</span>
          <span>{completedCount} of {cards.length} collected</span>
        </div>

        <ul className="checklist">
          {cards.map((card) => {
            const isCompleted = completedCards.includes(card.id)
            return (
              <li key={card.id} className={isCompleted ? 'card-row is-complete' : 'card-row'}>
                <button
                  className="card-toggle"
                  type="button"
                  aria-pressed={isCompleted}
                  onClick={() => toggleCard(card.id)}
                >
                  <span className="checkbox" aria-hidden="true">{isCompleted ? '✓' : ''}</span>
                  <span className="card-copy">
                    <strong>{card.name}</strong>
                    <small>{card.team} / No. {String(card.id).padStart(3, '0')}</small>
                  </span>
                  <span className="status">{isCompleted ? 'Collected' : 'Add to collection'}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <footer className="panel-footer">
          <span>Progress is saved on this device.</span>
          <button className="reset-button" type="button" onClick={resetChecklist} disabled={completedCount === 0}>
            Reset list
          </button>
        </footer>
      </section>
    </main>
  )
}
