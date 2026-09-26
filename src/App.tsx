import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { cards } from './data/cards'
import { supabase } from './lib/supabase'

const setKey = 'uefa-club-competitions'
const storageKey = `living-set-checklist:${setKey}`
const cardsPerPage = 12
const clubs = ['All Clubs', ...Array.from(new Set(cards.map((card) => card.team))).sort()]

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
  const [selectedClub, setSelectedClub] = useState('All Clubs')
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(Boolean(supabase))
  const [cloudLoading, setCloudLoading] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [cloudMessage, setCloudMessage] = useState('')
  const [pendingLocalImport, setPendingLocalImport] = useState<number[] | null>(null)
  const completedCount = cards.filter((card) => completedCards.includes(card.id)).length
  const progress = Math.round((completedCount / cards.length) * 100)
  const filteredCards = selectedClub === 'All Clubs' ? cards : cards.filter((card) => card.team === selectedClub)
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / cardsPerPage))
  const visibleCards = filteredCards.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage)

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }

    let active = true
    const client = supabase
    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setAuthMessage(error.message)
      setSession(data.session)
      setAuthLoading(false)
    })

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthMessage('')
      setAuthLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !session) {
      setCloudLoading(false)
      setPendingLocalImport(null)
      return
    }

    let active = true
    const client = supabase
    setCloudLoading(true)
    setCloudMessage('')

    void client
      .from('collection_items')
      .select('card_id')
      .eq('user_id', session.user.id)
      .eq('set_key', setKey)
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setCloudMessage(`Could not load cloud progress: ${error.message}`)
          setCloudLoading(false)
          return
        }

        const cloudIds = (data ?? []).map((row) => row.card_id)
        const validCardIds = new Set(cards.map((card) => card.id))
        const localIds = readCompletedCards().filter((id) => validCardIds.has(id))
        if (cloudIds.length === 0 && localIds.length > 0) {
          setPendingLocalImport(localIds)
        } else {
          setCompletedCards(cloudIds)
          setPendingLocalImport(null)
        }
        setCloudMessage('Collection synced with Supabase.')
        setCloudLoading(false)
      })

    return () => {
      active = false
    }
  }, [session])

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(completedCards))
  }, [completedCards])

  async function requestSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    setAuthMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}` },
    })
    setAuthMessage(error ? error.message : 'Check your email for a secure sign-in link.')
  }

  async function signOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) {
      setAuthMessage(error.message)
      return
    }
    setCompletedCards([])
    setCloudMessage('Signed out. This device’s collection view was cleared.')
  }

  async function toggleCard(id: number) {
    if (cloudLoading || pendingLocalImport) return
    const isCollected = completedCards.includes(id)

    if (supabase && session) {
      const client = supabase
      const result = isCollected
        ? await client.from('collection_items').delete().eq('user_id', session.user.id).eq('set_key', setKey).eq('card_id', id)
        : await client.from('collection_items').insert({ user_id: session.user.id, set_key: setKey, card_id: id })
      if (result.error) {
        setCloudMessage(`Could not save this card: ${result.error.message}`)
        return
      }
    }

    setCompletedCards((current) =>
      isCollected ? current.filter((cardId) => cardId !== id) : [...current, id],
    )
    setCloudMessage(supabase && session ? 'Collection synced with Supabase.' : 'Saved on this device.')
  }

  async function importLocalCollection() {
    if (!supabase || !session || !pendingLocalImport) return
    const client = supabase
    const rows = pendingLocalImport.map((cardId) => ({ user_id: session.user.id, set_key: setKey, card_id: cardId }))
    const { error } = await client.from('collection_items').insert(rows)
    if (error) {
      setCloudMessage(`Could not import local progress: ${error.message}`)
      return
    }
    setCompletedCards(pendingLocalImport)
    setPendingLocalImport(null)
    setCloudMessage('Local progress imported and synced.')
  }

  function startFreshCloudCollection() {
    setCompletedCards([])
    setPendingLocalImport(null)
    setCloudMessage('Using an empty cloud collection.')
  }

  async function resetChecklist() {
    if (supabase && session) {
      const client = supabase
      const { error } = await client.from('collection_items').delete().eq('user_id', session.user.id).eq('set_key', setKey)
      if (error) {
        setCloudMessage(`Could not reset cloud progress: ${error.message}`)
        return
      }
    }
    setCompletedCards([])
    setCloudMessage(supabase && session ? 'Cloud collection reset.' : 'Saved on this device.')
  }

  function changeClub(club: string) {
    setSelectedClub(club)
    setCurrentPage(1)
  }

  return (
    <main className="app-shell">
      <section className="checklist-panel" aria-labelledby="page-title">
        <header className="page-header">
          <div>
            <p className="eyebrow">Collection tracker</p>
            <h1 id="page-title">UEFA Living Set</h1>
            <p className="intro">Track your Topps UEFA Club Competitions soccer cards.</p>
            {supabase ? (
              authLoading ? <p className="account-status">Checking sign-in…</p> : session ? (
                <div className="account-controls">
                  <span className="account-status">Signed in as {session.user.email}</span>
                  <button className="text-button" type="button" onClick={signOut}>Sign out</button>
                </div>
              ) : (
                <form className="sign-in-form" onSubmit={requestSignIn}>
                  <label htmlFor="sign-in-email">Sign in to sync between devices</label>
                  <div>
                    <input id="sign-in-email" type="email" autoComplete="email" required value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" />
                    <button type="submit">Email me a sign-in link</button>
                  </div>
                  {authMessage && <p role="status">{authMessage}</p>}
                </form>
              )
            ) : <p className="account-status">Cloud sync not configured; progress is saved on this device.</p>}
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

        <div className="filter-row">
          <label htmlFor="club-filter">Filter by club</label>
          <select id="club-filter" value={selectedClub} onChange={(event) => changeClub(event.target.value)}>
            {clubs.map((club) => <option key={club}>{club}</option>)}
          </select>
        </div>

        {cloudLoading && <p className="cloud-message" role="status">Loading your cloud collection…</p>}
        {pendingLocalImport && (
          <aside className="import-notice" aria-label="Import local progress">
            <p>This device has {pendingLocalImport.length} collected cards for this soccer set. Import them into your account?</p>
            <div>
              <button type="button" onClick={importLocalCollection}>Import this device’s progress</button>
              <button type="button" onClick={startFreshCloudCollection}>Start with cloud collection</button>
            </div>
          </aside>
        )}
        {cloudMessage && <p className="cloud-message" role="status">{cloudMessage}</p>}

        <ul className="checklist">
          {visibleCards.map((card) => {
            const isCompleted = completedCards.includes(card.id)
            return (
              <li key={card.id} className={isCompleted ? 'card-row is-complete' : 'card-row'}>
                <button
                  className="card-toggle"
                  type="button"
                  aria-pressed={isCompleted}
                  disabled={cloudLoading || Boolean(pendingLocalImport)}
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
          <span>{supabase && session ? 'Progress is synced to your account.' : 'Progress is saved on this device.'}</span>
          <button className="reset-button" type="button" onClick={resetChecklist} disabled={completedCount === 0}>
            Reset list
          </button>
        </footer>
      </section>
    </main>
  )
}
