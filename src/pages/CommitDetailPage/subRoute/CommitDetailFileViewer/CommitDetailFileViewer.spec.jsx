import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useScrollToLine } from 'ui/CodeRenderer/hooks/useScrollToLine'

import CommitDetailFileViewer from './CommitDetailFileViewer'

jest.mock('ui/CodeRenderer/hooks/useScrollToLine')

const mockOwner = {
  username: 'cool-user',
}

const mockCoverage = {
  commit: {
    commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
    flagNames: ['a', 'b'],
    coverageFile: {
      content:
        'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n\n\n\n',
      coverage: [
        {
          line: 1,
          coverage: 'H',
        },
        {
          line: 2,
          coverage: 'H',
        },
        {
          line: 4,
          coverage: 'H',
        },
        {
          line: 5,
          coverage: 'H',
        },
        {
          line: 7,
          coverage: 'H',
        },
        {
          line: 8,
          coverage: 'H',
        },
      ],
    },
  },
  branch: null,
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (
    initialEntries = [
      '/gh/codecov/cool-repo/commit/sha256/blob/directory/file.js',
    ]
  ) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/commit/:commit/blob/:path+">
            {children}
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('CommitDetailFileViewer', () => {
  function setup() {
    useScrollToLine.mockImplementation(() => ({
      lineRef: () => {},
      handleClick: jest.fn(),
      targeted: false,
    }))

    server.use(
      graphql.query('DetailOwner', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: mockOwner }))
      ),
      graphql.query('CoverageForFile', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: { repository: mockCoverage } }))
      )
    )
  }

  describe('rendering component', () => {
    beforeEach(() => setup())

    describe('displaying the tree path', () => {
      it('displays repo link', async () => {
        render(<CommitDetailFileViewer />, { wrapper: wrapper() })

        const repoName = await screen.findByRole('link', { name: 'cool-repo' })
        expect(repoName).toBeInTheDocument()
        expect(repoName).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/commit/sha256/tree'
        )
      })

      it('displays directory link', async () => {
        render(<CommitDetailFileViewer />, { wrapper: wrapper() })

        const repoName = await screen.findByRole('link', { name: 'directory' })
        expect(repoName).toBeInTheDocument()
        expect(repoName).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/commit/sha256/tree/directory'
        )
      })

      it('displays file namee', async () => {
        render(<CommitDetailFileViewer />, { wrapper: wrapper() })

        const fileName = await screen.findByText('file.js')
        expect(fileName).toBeInTheDocument()
      })
    })

    describe('displaying the file viewer', () => {
      it('sets the correct url link', async () => {
        render(<CommitDetailFileViewer />, { wrapper: wrapper() })

        const copyLink = await screen.findByRole('link', {
          name: 'directory/file.js',
        })
        expect(copyLink).toBeInTheDocument()
        expect(copyLink).toHaveAttribute('href', '#directory/file.js')
      })
    })
  })
})
