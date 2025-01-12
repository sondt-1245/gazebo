import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import HeaderBanners from './HeaderBanners'

jest.mock('config')

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/:owner">{children}</Route>
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

describe('HeaderBanners', () => {
  function setup({
    isSelfHosted = false,
    hasReachedLimit = false,
    isReachingLimit = false,
    integrationId = 9,
  }) {
    config.IS_SELF_HOSTED = isSelfHosted
    server.use(
      graphql.query('OwnerPageData', (req, res, ctx) => {
        if (hasReachedLimit) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                numberOfUploads: 252,
              },
            })
          )
        }

        if (isReachingLimit) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                numberOfUploads: 230,
              },
            })
          )
        }

        return res(ctx.status(200), ctx.data({}))
      }),
      rest.get('/internal/gh/codecov/account-details/', (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ integrationId }))
      )
    )
  }

  describe('displaying ExceededUploadsAlert banner', () => {
    describe('org has exceeded limit', () => {
      beforeEach(() => {
        setup({
          hasReachedLimit: true,
        })
      })

      it('displays the banner', async () => {
        render(
          <HeaderBanners
            provider="gh"
            owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
          />,
          { wrapper }
        )

        const banner = await screen.findByText('Upload limit has been reached')
        expect(banner).toBeInTheDocument()
      })
    })

    describe('org has not exceeded limit', () => {
      beforeEach(() => {
        setup({
          hasReachedLimit: false,
        })
      })

      it('does not display the banner', async () => {
        render(
          <HeaderBanners
            provider="gh"
            owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
          />,
          { wrapper }
        )

        const banner = screen.queryByText('Upload limit has been reached')
        expect(banner).not.toBeInTheDocument()
      })
    })
  })

  describe('displaying ReachingUploadLimit banner', () => {
    describe('org has exceeded limit', () => {
      beforeEach(() => {
        setup({
          isReachingLimit: true,
        })
      })

      it('displays the banner', async () => {
        render(
          <HeaderBanners
            provider="gh"
            owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
          />,
          { wrapper }
        )

        const banner = await screen.findByText('Upload limit almost reached')
        expect(banner).toBeInTheDocument()
      })
    })

    describe('org has not exceeded limit', () => {
      beforeEach(() => {
        setup({
          isReachingLimit: false,
        })
      })

      it('does not display the banner', async () => {
        render(
          <HeaderBanners
            provider="gh"
            owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
          />,
          { wrapper }
        )

        const banner = screen.queryByText('Upload limit almost reached')
        expect(banner).not.toBeInTheDocument()
      })
    })
  })

  describe('user does not have gh app installed', () => {
    beforeEach(() => {
      setup({
        integrationId: null,
      })
    })

    it('displays github app config banner', async () => {
      render(
        <HeaderBanners
          provider="gh"
          owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
        />,
        { wrapper }
      )

      const banner = screen.getByText(/Codecov's GitHub app/)
      expect(banner).toBeInTheDocument()
    })
  })

  describe('user is running in self hosted mode', () => {
    beforeEach(() => {
      setup({
        isSelfHosted: true,
      })
    })

    it('renders an empty dom', () => {
      const { container } = render(
        <HeaderBanners
          provider="gh"
          owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
        />,
        { wrapper }
      )

      expect(container).toBeEmptyDOMElement()
    })
  })
})
