import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { subDays } from 'date-fns'
import { MemoryRouter, Route } from 'react-router-dom'
import useIntersection from 'react-use/lib/useIntersection'

import { useRepos } from 'services/repos'

import ChartSelectors from './ChartSelectors'
;(() => {
  return (global.ResizeObserver = class ResizeObserver {
    constructor(cb) {
      this.cb = cb
    }
    observe() {
      this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }])
    }
    unobserve() {}
    disconnect() {}
  })
})()

jest.mock('services/repos')
jest.mock('react-use/lib/useIntersection')

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date('2022-04-20'))
})
afterAll(() => {
  jest.useRealTimers()
})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/analytics/gh/codecov']}>
    <Route path="/analytics/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('ChartSelectors', () => {
  afterEach(() => jest.resetAllMocks())

  function setup(useReposMock) {
    // https://github.com/testing-library/user-event/issues/1034
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    const fetchNextPage = jest.fn()
    const repositories = [
      {
        private: false,
        author: {
          username: 'owner1',
        },
        name: 'Repo name 1',
        latestCommitAt: subDays(new Date(), 3),
        coverage: 43,
        active: true,
      },
      {
        private: false,
        author: {
          username: 'owner2',
        },
        name: 'Repo name 3',
        latestCommitAt: subDays(new Date(), 4),
        coverage: 35,
        active: false,
      },
    ]

    useRepos.mockReturnValue({
      data: { repos: repositories },
      fetchNextPage,
      hasNextPage: useReposMock?.hasNextPage || true,
    })

    return { fetchNextPage, user }
  }

  describe('renders component', () => {
    beforeEach(() => setup())

    it('renders date picker', async () => {
      render(
        <ChartSelectors
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={jest.fn()}
        />,
        { wrapper }
      )

      const datePicker = screen.getByText('Pick a date')
      expect(datePicker).toBeInTheDocument()
    })

    it('renders multiselect', async () => {
      render(
        <ChartSelectors
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={jest.fn()}
        />,
        { wrapper }
      )

      const multiSelect = await screen.findByText('All Repos')
      expect(multiSelect).toBeInTheDocument()
    })

    it('renders clear filters', async () => {
      render(
        <ChartSelectors
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={jest.fn()}
        />,
        { wrapper }
      )

      const clearFilters = await screen.findByText('Clear filters')
      expect(clearFilters).toBeInTheDocument()
    })
  })

  describe('interacting with the date picker', () => {
    it('updates the location params', async () => {
      const { user } = setup()
      const updateParams = jest.fn()
      render(
        <ChartSelectors
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={updateParams}
        />,
        { wrapper }
      )

      let datePicker = screen.getByText('Pick a date')
      await act(async () => {
        await user.click(datePicker)
      })

      const gridCells = screen.getAllByRole('gridcell', { name: '31' })
      const date = within(gridCells[0]).getByText('31')
      await act(async () => {
        await user.click(date)
      })

      await waitFor(() =>
        expect(updateParams).toBeCalledWith({
          endDate: null,
          startDate: new Date('2022-03-31T00:00:00.000Z'),
        })
      )
    })

    describe('start date and end date set and user clicks on the date', () => {
      it('clears the params', async () => {
        const { user } = setup()
        const updateParams = jest.fn()
        const testDate = new Date('2022-03-31T00:00:00.000Z')

        render(
          <ChartSelectors
            owner="bob"
            active={true}
            sortItem={{
              ordering: 'NAME',
              direction: 'ASC',
            }}
            params={{
              search: 'Repo name 1',
              repositories: [],
              startDate: testDate,
              endDate: testDate,
            }}
            updateParams={updateParams}
          />,
          { wrapper }
        )

        let datePicker = screen.getByText('Mar 31, 2022 - Mar 31, 2022')
        await act(async () => {
          await user.click(datePicker)
        })

        let gridCells = screen.getAllByRole('gridcell', { name: '31' })
        let date = within(gridCells[0]).getByText('31')
        await act(async () => {
          await user.click(date)
        })
      })
    })
  })

  describe('interacting with the multi select', () => {
    it('displays list of repos when opened', async () => {
      const { user } = setup()
      render(
        <ChartSelectors
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={jest.fn()}
        />,
        { wrapper }
      )

      const multiselect = screen.getByText('All Repos')
      await user.click(multiselect)

      const repo1 = screen.getByText('Repo name 1')
      expect(repo1).toBeInTheDocument()

      const repo3 = screen.getByText('Repo name 3')
      expect(repo3).toBeInTheDocument()
    })

    describe('when item clicked', () => {
      it('updates button value', async () => {
        const { user } = setup()
        render(
          <ChartSelectors
            active={true}
            sortItem={{
              ordering: 'NAME',
              direction: 'ASC',
            }}
            params={{ search: 'Repo name 1', repositories: ['Repo name 1'] }}
            updateParams={jest.fn()}
          />,
          { wrapper }
        )

        const multiselect = screen.getByText('1 Repo selected')
        await user.click(multiselect)

        const repo1 = screen.getByText('Repo name 3')
        await user.click(repo1)

        const multiSelectUpdated = screen.getByText('2 Repos selected')
        expect(multiSelectUpdated).toBeInTheDocument()
      })

      it('updates url params', async () => {
        const { user } = setup()
        const updateParams = jest.fn()
        render(
          <ChartSelectors
            active={true}
            sortItem={{
              ordering: 'NAME',
              direction: 'ASC',
            }}
            params={{ search: 'Repo name 1', repositories: [] }}
            updateParams={updateParams}
          />,
          { wrapper }
        )

        const multiselect = screen.getByText('All Repos')
        await user.click(multiselect)

        const repo1 = screen.getByText('Repo name 1')
        await user.click(repo1)

        await waitFor(() =>
          expect(updateParams).toBeCalledWith({ repositories: ['Repo name 1'] })
        )
      })
    })

    describe('when searching for a repo', () => {
      it('displays the searchbox', async () => {
        const { user } = setup()
        render(
          <ChartSelectors
            active={true}
            sortItem={{
              ordering: 'NAME',
              direction: 'ASC',
            }}
            params={{ search: 'Repo name 1', repositories: [] }}
            updateParams={jest.fn()}
          />,
          { wrapper }
        )

        const multiselect = screen.getByText('All Repos')
        await user.click(multiselect)

        const searchBox = screen.getByPlaceholderText('Search for Repos')
        expect(searchBox).toBeInTheDocument()
      })

      it('updates the textbox value when typing', async () => {
        const { user } = setup()
        render(
          <ChartSelectors
            active={true}
            sortItem={{
              ordering: 'NAME',
              direction: 'ASC',
            }}
            params={{ search: 'Repo name 1', repositories: [] }}
            updateParams={jest.fn()}
          />,
          { wrapper }
        )

        const multiselect = screen.getByText('All Repos')
        await user.click(multiselect)

        const searchBox = screen.getByPlaceholderText('Search for Repos')
        await user.type(searchBox, 'codecov')

        const searchBoxUpdated = screen.getByPlaceholderText('Search for Repos')
        expect(searchBoxUpdated).toHaveAttribute('value', 'codecov')

        await waitFor(() => {
          expect(useRepos).toBeCalledWith({
            active: true,
            first: Infinity,
            owner: 'codecov',
            sortItem: {
              direction: 'ASC',
              ordering: 'NAME',
            },
            suspense: false,
            term: 'codecov',
          })
        })
      })
    })

    describe('when onLoadMore is triggered', () => {
      describe('when there is a next page', () => {
        it('calls fetchNextPage', async () => {
          const { user, fetchNextPage } = setup()
          useIntersection.mockReturnValue({
            isIntersecting: true,
          })

          render(
            <ChartSelectors
              active={true}
              sortItem={{
                ordering: 'NAME',
                direction: 'ASC',
              }}
              params={{ search: 'Repo name 1', repositories: [] }}
              updateParams={jest.fn()}
            />,
            { wrapper }
          )

          const multiselect = screen.getByText('All Repos')
          await user.click(multiselect)

          expect(fetchNextPage).toBeCalled()
        })
      })

      describe('when there is no next page', () => {
        it('does not calls fetchNextPage', async () => {
          const { user, fetchNextPage } = setup({ hasNextPage: false })

          render(
            <ChartSelectors
              active={true}
              sortItem={{
                ordering: 'NAME',
                direction: 'ASC',
              }}
              params={{ search: 'Repo name 1', repositories: [] }}
              updateParams={jest.fn()}
            />,
            { wrapper }
          )

          const multiselect = screen.getByText('All Repos')
          await user.click(multiselect)

          expect(fetchNextPage).not.toBeCalled()
        })
      })
    })
  })

  describe('interacting with clear filters', () => {
    it('updates params', async () => {
      const { user } = setup()
      const updateParams = jest.fn()
      render(
        <ChartSelectors
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={updateParams}
        />,
        { wrapper }
      )

      const clearFilters = screen.getByRole('button', {
        name: 'Clear filters',
      })
      await user.click(clearFilters)

      await waitFor(() =>
        expect(updateParams).toHaveBeenCalledWith({
          endDate: null,
          repositories: [],
          startDate: null,
        })
      )
    })
  })
})
