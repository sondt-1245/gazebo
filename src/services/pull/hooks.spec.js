import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { usePull, useSingularImpactedFileComparison } from './index'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const pull = {
  pullId: 5,
  title: 'fix code',
  state: 'OPEN',
  updatestamp: '2021-03-03T17:54:07.727453',
  author: {
    username: 'landonorris',
  },
  head: {
    commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
    totals: {
      coverage: 78.33,
    },
  },
  comparedTo: {
    commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
  },
  compareWithBase: {
    patchTotals: {
      coverage: 92.12,
    },
    changeCoverage: 38.94,
  },
}

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'

describe('usePull', () => {
  afterEach(() => queryClient.clear())

  function setup(data) {
    server.use(
      graphql.query('Pull', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(data))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({
        owner: {
          isCurrentUserPartOfOrg: true,
          repository: {
            defaultBranch: 'umbrasyl',
            private: true,
            pull,
          },
        },
      })
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () => usePull({ provider, owner, repo }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            defaultBranch: 'umbrasyl',
            hasAccess: true,
            pull,
          })
        )
      })
    })
  })

  describe(`when user shouldn't have access`, () => {
    beforeEach(() => {
      setup({
        owner: {
          isCurrentUserPartOfOrg: false,
          repository: {
            private: true,
            pull,
          },
        },
      })
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () => usePull({ provider, owner, repo }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            hasAccess: false,
            pull,
          })
        )
      })
    })
  })
})

const mockSingularImpactedFilesData = {
  headName: 'file A',
  isNewFile: true,
  isRenamedFile: false,
  isDeletedFile: false,
  isCriticalFile: false,
  headCoverage: {
    percentCovered: 90.23,
  },
  baseCoverage: {
    percentCovered: 23.42,
  },
  patchCoverage: {
    percentCovered: 27.43,
  },
  changeCoverage: 58.333333333333336,
  segments: {
    results: [
      {
        header: '@@ -0,0 +1,45 @@',
        lines: [
          {
            baseNumber: null,
            headNumber: '1',
            baseCoverage: null,
            headCoverage: 'H',
            content: '+export default class Calculator {',
            coverageInfo: {
              hitCount: null,
              hitUploadIds: null,
            },
          },
          {
            baseNumber: null,
            headNumber: '2',
            baseCoverage: null,
            headCoverage: 'H',
            content: '+  private value = 0;',
            coverageInfo: {
              hitCount: 18,
              hitUploadIds: [0],
            },
          },
          {
            baseNumber: null,
            headNumber: '3',
            baseCoverage: null,
            headCoverage: 'H',
            content: '+  private calcMode = ""',
            coverageInfo: {
              hitCount: null,
              hitUploadIds: null,
            },
          },
        ],
      },
    ],
  },
}

describe('useSingularImpactedFileComparison', () => {
  afterEach(() => queryClient.clear())

  function setup(data) {
    server.use(
      graphql.query('ImpactedFileComparison', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(data))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            pull: {
              compareWithBase: {
                impactedFile: mockSingularImpactedFilesData,
              },
            },
          },
        },
      })
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useSingularImpactedFileComparison({
              provider,
              owner,
              repo,
              pullId: 10,
              path: 'someFile.js',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            fileLabel: 'New',
            headName: 'file A',
            isCriticalFile: false,
            segments: [
              {
                header: '@@ -0,0 +1,45 @@',
                lines: [
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+export default class Calculator {',
                    headCoverage: 'H',
                    headNumber: '1',
                    coverageInfo: {
                      hitCount: null,
                      hitUploadIds: null,
                    },
                  },
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+  private value = 0;',
                    headCoverage: 'H',
                    headNumber: '2',
                    coverageInfo: {
                      hitCount: 18,
                      hitUploadIds: [0],
                    },
                  },
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+  private calcMode = ""',
                    headCoverage: 'H',
                    headNumber: '3',
                    coverageInfo: {
                      hitCount: null,
                      hitUploadIds: null,
                    },
                  },
                ],
              },
            ],
          })
        )
      })
    })
  })

  describe('when called with renamed file', () => {
    beforeEach(() => {
      const renamedImpactedFile = {
        headName: 'file A',
        isRenamedFile: true,
        isCriticalFile: false,
        segments: { results: [] },
      }
      setup({
        owner: {
          repository: {
            pull: {
              compareWithBase: {
                impactedFile: renamedImpactedFile,
              },
            },
          },
        },
      })
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useSingularImpactedFileComparison({
              provider,
              owner,
              repo,
              pullId: 10,
              path: 'someFile.js',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            fileLabel: 'Renamed',
            headName: 'file A',
            isCriticalFile: false,
            segments: [],
          })
        )
      })
    })
  })

  describe('when called with deleted file', () => {
    beforeEach(() => {
      const renamedImpactedFile = {
        headName: 'file A',
        isDeletedFile: true,
        isCriticalFile: false,
        segments: { results: [] },
      }
      setup({
        owner: {
          repository: {
            pull: {
              compareWithBase: {
                impactedFile: renamedImpactedFile,
              },
            },
          },
        },
      })
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useSingularImpactedFileComparison({
              provider,
              owner,
              repo,
              pullId: 10,
              path: 'someFile.js',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            fileLabel: 'Deleted',
            headName: 'file A',
            isCriticalFile: false,
            segments: [],
          })
        )
      })
    })
  })

  describe('when called with an unchanged file label', () => {
    beforeEach(() => {
      const renamedImpactedFile = {
        headName: 'file A',
        isNewFile: false,
        isRenamedFile: false,
        isDeletedFile: false,
        isCriticalFile: false,
        segments: { results: [] },
      }
      setup({
        owner: {
          repository: {
            pull: {
              compareWithBase: {
                impactedFile: renamedImpactedFile,
              },
            },
          },
        },
      })
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useSingularImpactedFileComparison({
              provider,
              owner,
              repo,
              pullId: 10,
              path: 'someFile.js',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            fileLabel: null,
            headName: 'file A',
            isCriticalFile: false,
            segments: [],
          })
        )
      })
    })
  })
})
