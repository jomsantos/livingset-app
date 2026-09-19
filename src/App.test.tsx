import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  window.localStorage.clear()
})

describe('App', () => {
  it('renders the full checklist and initial progress', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Topps Living Set' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /card 1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /card 2/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /card 3/i })).toBeInTheDocument()
    expect(screen.getByText('00')).toBeInTheDocument()
    expect(screen.getByText('0 of 3 collected')).toBeInTheDocument()
  })

  it('toggles a card and saves the completed card to localStorage', () => {
    render(<App />)

    const card = screen.getByRole('button', { name: /card 1/i })
    fireEvent.click(card)

    expect(card).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('33')).toBeInTheDocument()
    expect(screen.getByText('1 of 3 collected')).toBeInTheDocument()
    expect(window.localStorage.getItem('living-set-checklist')).toBe('[1]')
  })

  it('restores saved progress and can reset it', () => {
    window.localStorage.setItem('living-set-checklist', '[2]')
    render(<App />)

    expect(screen.getByRole('button', { name: /card 2/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('1 of 3 collected')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset list' }))

    expect(screen.getByText('0 of 3 collected')).toBeInTheDocument()
    expect(window.localStorage.getItem('living-set-checklist')).toBe('[]')
  })
})
