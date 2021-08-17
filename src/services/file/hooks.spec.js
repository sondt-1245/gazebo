import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useFileCoverage } from './hooks'
import { MemoryRouter, Route } from 'react-router-dom'
import _ from 'lodash'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const provider = 'gh'

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useFileCoverage', () => {
  let hookData

  function setup(dataReturned) {
    server.use(
      rest.post(`/graphql/gh`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: dataReturned }))
      })
    )
    hookData = renderHook(() => useFileCoverage({ provider }), {
      wrapper,
    })
  }

  describe('when called for commit', () => {
    const data = {
      owner: {
        repository: {
          commit: {
            commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
            coverageFile: {
              content:
                'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n\n\n\n',
              coverage: [
                {
                  line: 1,
                  coverage: 1,
                },
                {
                  line: 2,
                  coverage: 1,
                },
                {
                  line: 4,
                  coverage: 1,
                },
                {
                  line: 5,
                  coverage: 1,
                },
                {
                  line: 7,
                  coverage: 1,
                },
                {
                  line: 8,
                  coverage: 1,
                },
              ],
            },
          },
          branch: null,
        },
      },
    }
    beforeEach(() => {
      setup(data)
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns commit file coverage', () => {
      expect(hookData.result.current.data).toEqual({
        ...data.owner.repository.commit.coverageFile,
        coverage: _.chain(data.owner.repository.commit.coverageFile.coverage)
          .keyBy('line')
          .mapValues('coverage')
          .value(),
      })
    })
  })

  describe('when called for branch', () => {
    const data = {
      owner: {
        repository: {
          commit: null,
          branch: {
            name: 'master',
            head: {
              commitid: '98a8b5f3ed2553d1b08ea02b2a0c3a1c1e001cf2',
              coverageFile: {
                content:
                  'def uncovered_if(var=True):\n    if var:\n      return False\n    else:\n      return True\n\n\ndef fully_covered():\n    # Added a change here\n    return True\n\ndef uncovered():\n    return True\n\n',
                coverage: [
                  {
                    line: 1,
                    coverage: 1,
                  },
                  {
                    line: 2,
                    coverage: 1,
                  },
                  {
                    line: 3,
                    coverage: 1,
                  },
                  {
                    line: 5,
                    coverage: 0,
                  },
                  {
                    line: 8,
                    coverage: 1,
                  },
                  {
                    line: 10,
                    coverage: 1,
                  },
                  {
                    line: 12,
                    coverage: 1,
                  },
                  {
                    line: 13,
                    coverage: 0,
                  },
                ],
              },
            },
          },
        },
      },
    }
    beforeEach(() => {
      setup(data)
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns branch file coverage', () => {
      expect(hookData.result.current.data).toEqual({
        ...data.owner.repository.branch.head.coverageFile,
        coverage: _.chain(
          data.owner.repository.branch.head.coverageFile.coverage
        )
          .keyBy('line')
          .mapValues('coverage')
          .value(),
      })
    })
  })
})