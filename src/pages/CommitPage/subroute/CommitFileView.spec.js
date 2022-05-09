import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { useCommitBasedCoverageForFileviewer } from 'services/file'

import CommitFileView from './CommitFileView'

jest.mock(
  'ui/FileviewerToggleHeader/FileviewerToggleHeader',
  () => () => 'The Fileviewer Toggle Header'
)
jest.mock(
  'ui/CodeRendererProgressHeader/CodeRendererProgressHeader',
  () => () => 'The Progress Header for Coderenderer'
)
jest.mock('shared/FileViewer/CodeRenderer', () => () => 'The Coderenderer')
jest.mock('services/file/hooks')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))

const queryClient = new QueryClient()

const diff = {
  headCoverage: { coverage: 40.23 },
  baseCoverage: { coverage: 14.12 },
}

describe('CommitFileView', () => {
  function setup(props) {
    const { content } = props

    useParams.mockReturnValue({
      owner: 'fjord',
      provider: 'gh',
      commit: '123sha',
      repo: 'gazebo',
      path: 'folder/subfolder/file.js',
    })
    useCommitBasedCoverageForFileviewer.mockReturnValue({
      isLoading: false,
      totals: 53.43,
      coverage: {
        1: 'H',
        2: 'H',
        5: 'H',
        6: 'H',
        9: 'H',
        10: 'H',
        13: 'M',
        14: 'P',
        15: 'M',
        16: 'M',
        17: 'M',
        21: 'H',
      },
      flagNames: ['flagOne', 'flagTwo'],
      content,
    })

    render(
      <MemoryRouter
        initialEntries={[
          '/gh/codecov/gazebo/commit/123sha/folder/subfolder/file.js',
        ]}
      >
        <Route path="/:provider/:owner/:repo/commit/:commit/:path">
          <QueryClientProvider client={queryClient}>
            <CommitFileView diff={diff} />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when there is content to be shown', () => {
    beforeEach(() => {
      setup({
        content:
          'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};',
      })
    })

    it('renders the Fileviewer Header, Coderenderer Header, and Coderenderer', () => {
      expect(
        screen.getByText(/The Fileviewer Toggle Header/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/The Progress Header for Coderenderer/)
      ).toBeInTheDocument()
      expect(screen.getByText(/The Coderenderer/)).toBeInTheDocument()
      expect(
        screen.queryByText(
          /There was a problem getting the source code from your provider./
        )
      ).not.toBeInTheDocument()
    })
  })

  describe('when there is no content to be shown', () => {
    beforeEach(() => {
      setup({ content: null })
    })

    it('renders the Fileviewer Header, Coderenderer Header, and error message', () => {
      expect(
        screen.getByText(/The Fileviewer Toggle Header/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/The Progress Header for Coderenderer/)
      ).toBeInTheDocument()
      expect(screen.queryByText(/The Coderenderer/)).not.toBeInTheDocument()
      expect(
        screen.getByText(
          /There was a problem getting the source code from your provider./
        )
      ).toBeInTheDocument()
    })
  })
})
