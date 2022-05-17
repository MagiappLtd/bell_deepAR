import { preloadScript } from 'opentok-react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { RecoilRoot } from 'recoil'
import AfterLeaving from './components/AfterLeaving/AfterLeaving'
import NotFound from './components/NotFound/NotFound'
import Root from './components/Root/Root'
import VideoApp from './components/VideoApp/VideoApp'
import BrowserUnsupportedPage from './components/BrowserUnsupportedPage/BrowserUnsupportedPage'
import useBrowserSupported from './hooks/useBrowserSupported'

function App() {
  const isBrowserSupported = useBrowserSupported()

  return (
    <>
      {isBrowserSupported ? (
        <RecoilRoot>
          <Router>
            <Switch>
              <Route exact path="/" component={Root} />
              <Route path="/rooms/:roomName" component={VideoApp} />
              <Route exact path="/thanks" component={AfterLeaving} />
              <Route component={NotFound} />
            </Switch>
          </Router>
        </RecoilRoot>
      ) : (
        <BrowserUnsupportedPage />
      )}
    </>
  )
}

export default preloadScript(App)
