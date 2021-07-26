import Dropdown from './Dropdown'
import Button from 'ui/Button'
import A from 'ui/A'
import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'
import { useUser } from 'services/user'
import { useParams } from 'react-router-dom'
import { Suspense } from 'react'
import RequestButton from './RequestButton'

export function LoginPrompt() {
  return (
    <div
      data-testid="login-prompt"
      className="flex items-center justify-between mx-2 md:mx-0 gap-4"
    >
      <A to={{ pageName: 'signIn' }} variant="header">
        Log in
      </A>
      <Button to={{ pageName: 'signUp' }} variant="primary">
        Sign up
      </Button>
    </div>
  )
}

function DesktopMenu() {
  const { data: currentUser } = useUser({
    suspense: false,
  })
  const { owner, provider } = useParams()

  return (
    <>
      <div data-testid="desktop-menu" className="flex items-center gap-4">
        <A to={{ pageName: 'provider' }}>
          <span className="sr-only">Link to Homepage</span>
          <CodecovIcon />
        </A>
        <A to={{ pageName: 'docs' }} variant="header">
          Docs
        </A>
        <A to={{ pageName: 'support' }} variant="header">
          Support
        </A>
        <A to={{ pageName: 'blog' }} variant="header">
          Blog
        </A>
      </div>
      {currentUser ? (
        <div className="flex items-center space-between mx-2 md:mx-4">
          {!!owner && (
            <Suspense fallback={null}>
              <RequestButton owner={owner} provider={provider} />
            </Suspense>
          )}
          <Dropdown currentUser={currentUser} />
        </div>
      ) : (
        <LoginPrompt />
      )}
    </>
  )
}

export default DesktopMenu
