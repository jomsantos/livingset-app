import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'
import { cards } from './data/cards'

beforeEach(() => {
  window.localStorage.clear()
})

describe('App', () => {
  it('renders the full checklist and initial progress', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Topps Living Set' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: new RegExp(cards[0].name, 'i') })).toBeInTheDocument()
    expect(screen.getByText('00')).toBeInTheDocument()
    expect(screen.getByText(`0 of ${cards.length} collected`)).toBeInTheDocument()
  })

  it('toggles a card and saves the completed card to localStorage', () => {
    render(<App />)

    const card = screen.getByRole('button', { name: new RegExp(cards[0].name, 'i') })
    fireEvent.click(card)

    expect(card).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText(`${Math.round((1 / cards.length) * 100)}% complete`)).toBeInTheDocument()
    expect(screen.getByText(`1 of ${cards.length} collected`)).toBeInTheDocument()
    expect(window.localStorage.getItem('living-set-checklist')).toBe('[1]')
  })

  it('restores saved progress and can reset it', () => {
    window.localStorage.setItem('living-set-checklist', JSON.stringify([cards[0].id]))
    render(<App />)

    expect(screen.getByRole('button', { name: new RegExp(cards[0].name, 'i') })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(`1 of ${cards.length} collected`)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset list' }))

    expect(screen.getByText(`0 of ${cards.length} collected`)).toBeInTheDocument()
    expect(window.localStorage.getItem('living-set-checklist')).toBe('[]')
  })
})
