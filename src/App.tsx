import { useEffect, useState } from 'react'
import { cards } from './data/cards'

const storageKey = 'living-set-checklist'
const cardsPerPage = 12

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
  const [currentPage, setCurrentPage] = useState(1)
  const completedCount = cards.filter((card) => completedCards.includes(card.id)).length
  const progress = Math.round((completedCount / cards.length) * 100)
  const totalPages = Math.ceil(cards.length / cardsPerPage)
  const visibleCards = cards.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage)

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
            <h1 id="page-title">UEFA Living Set</h1>
            <p className="intro">Track your Topps UEFA Club Competitions soccer cards.</p>
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
          {visibleCards.map((card) => {
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

        <nav className="pagination" aria-label="Checklist pages">
          <button type="button" onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                className={page === currentPage ? 'page-number is-current' : 'page-number'}
                type="button"
                aria-current={page === currentPage ? 'page' : undefined}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setCurrentPage((page) => page + 1)} disabled={currentPage === totalPages}>
            Next
          </button>
        </nav>

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
