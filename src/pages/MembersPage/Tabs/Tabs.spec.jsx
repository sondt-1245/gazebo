import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Tabs from './Tabs'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('config')

describe('Tabs', () => {
  function setup(isSelfHosted = false) {
    config.IS_SELF_HOSTED = isSelfHosted

    render(
      <MemoryRouter initialEntries={['/members/gh/codecov']}>
        <Route path="/members/:provider/:owner">
          <Tabs />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when user is part of the org', () => {
    beforeEach(() => {
      setup()
    })

    it('renders links to the home page', () => {
      expect(
        screen.getByRole('link', {
          name: /repos/i,
        })
      ).toHaveAttribute('href', '/gh/codecov')
    })

    it('renders links to the analytics page', () => {
      expect(
        screen.getByRole('link', {
          name: /analytics/i,
        })
      ).toHaveAttribute('href', `/analytics/gh/codecov`)
    })

    it('renders links to the settings page', () => {
      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', `/account/gh/codecov`)
    })

    it('renders link to plan page', () => {
      expect(
        screen.getByRole('link', {
          name: /plan/i,
        })
      ).toHaveAttribute('href', `/plan/gh/codecov`)
    })

    it('renders link to members page', () => {
      expect(
        screen.getByRole('link', {
          name: /members/i,
        })
      ).toHaveAttribute('href', `/members/gh/codecov`)
    })
  })

  describe('when user is enterprise account', () => {
    beforeEach(() => {
      setup(true)
    })

    it('does not render link to members page', () => {
      expect(
        screen.queryByRole('link', {
          name: /members/i,
        })
      ).not.toBeInTheDocument()
    })

    it('does not render link to plan page', () => {
      expect(
        screen.queryByRole('link', {
          name: /plan/i,
        })
      ).not.toBeInTheDocument()
    })
  })
})
