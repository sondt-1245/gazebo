import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import FlagsTable from './FlagsTable'
import useRepoFlagsTable from './hooks'

jest.mock('./hooks')

const flagsData = [
  {
    name: 'flag1',
    percentCovered: 93.26,
    measurements: [],
  },
  {
    name: 'flag2',
    percentCovered: 91.74,
    measurements: [],
  },
]

describe('RepoContentsTable', () => {
  const fetchNextPage = jest.fn()

  function setup({
    isLoading = false,
    data = flagsData,
    hasNextPage = false,
  } = {}) {
    useRepoFlagsTable.mockReturnValue({
      data,
      isLoading,
      hasNextPage,
      fetchNextPage: fetchNextPage,
      isFetchingNextPage: false,
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
        <Route path="/:provider/:owner/:repo/flags">
          <FlagsTable />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders table headers', () => {
      expect(screen.getByText('Flags')).toBeInTheDocument()
      expect(screen.getByText('file coverage %')).toBeInTheDocument()
      expect(screen.getByText('trend last year')).toBeInTheDocument()
    })

    it('renders repo flags', () => {
      expect(screen.getByText('flag1')).toBeInTheDocument()
      expect(screen.getByText('flag2')).toBeInTheDocument()
    })

    it('renders flags coverage', () => {
      expect(screen.getByText(/93.26%/)).toBeInTheDocument()
      expect(screen.getByText(/91.74%/)).toBeInTheDocument()
    })

    it('renders flags trend', () => {
      expect(screen.getByText(/flag1 trend data/)).toBeInTheDocument()
      expect(screen.getByText(/flag2 trend data/)).toBeInTheDocument()
    })
  })

  describe('when api is loading', () => {
    beforeEach(() => {
      setup({ isLoading: true })
    })

    it('renders spinner', () => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })
  })

  describe('when no data is returned', () => {
    beforeEach(() => {
      setup({ data: [] })
    })

    it('renders empty state message', () => {
      expect(
        screen.getByText(
          /There was a problem getting flags data from your provider/
        )
      ).toBeInTheDocument()
    })
  })

  describe('when hasNextPage is true', () => {
    beforeEach(() => {
      setup({ hasNextPage: true })
    })

    it('renders load more button', () => {
      expect(screen.getByText(/Load More/)).toBeInTheDocument()
    })
    it('fires next page button click', () => {
      screen.getByText(/Load More/).click()
      expect(fetchNextPage).toHaveBeenCalled()
    })
  })
})