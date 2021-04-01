import React, { Suspense, lazy } from 'react';
import isElectron from 'is-electron'
import { HashRouter, BrowserRouter, Route, Redirect } from 'react-router-dom'
import { WorkhubProvider } from '@workerhive/client/dist'
import { AuthBase } from './views/Auth'
import { PageLoader } from './components/page-loader';
import { CRUD } from '@workerhive/plugins/dist/react'
import './App.css';
import { HubSetup } from './views/Auth/Hub';

const Dashboard = lazy(() => import('./views/Dashboard'));

let Router: any;

if (isElectron()) {
  Router = HashRouter
} else {
  Router = BrowserRouter
}

function App() {

  const [hubUrl, setHubUrl] = React.useState<string | null>(isElectron() ? localStorage.getItem('workhub-api') : (process.env.NODE_ENV == "development" ? 'https://rainbow.workhub.services' || 'http://localhost:4002' : window.location.origin));
  const token = localStorage.getItem('token')

  return (
    <Router>
      <div className="App">
        {hubUrl ? (
          <WorkhubProvider plugins={{crud: [CRUD]}} token={token || ''} url={hubUrl || ''}>
            <Route path="/dashboard" render={(props) => {
              if (token && token.length > 0) {
                return (
                  <Suspense fallback={
                    (<PageLoader size={42} text={"Loading the hub..."} />)
                  }>
                  
                      <Dashboard {...props} />
                  
                  </Suspense>
                )
              } else {
                return (
                  <Redirect to="/login" />
                )
              }
            }} />
            <Route
              path={["/", "/login", "/reset", "/signup", "/forgot"]}
              exact
              render={(props) => isElectron() ? ((localStorage.getItem('token') || "").length > 0) ? <Redirect to="/dashboard" /> : <HubSetup {...props} /> : <AuthBase {...props} />} />
          </WorkhubProvider>
        ) : (
          <Route path="/" exact component={HubSetup} />
        )}

      </div>
    </Router>
  );
}

export default App;
