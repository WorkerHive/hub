import React from 'react';
import isElectron from 'is-electron'
import { HashRouter, BrowserRouter, Route, Redirect } from 'react-router-dom'
import { WorkhubProvider } from '@workerhive/client'
import {Login} from './views/Login';

import './App.css';
import { Dashboard } from './views/Dashboard';

let Router : any;

if(isElectron()){
  Router = HashRouter
}else{
  Router = BrowserRouter
}

function App() {

  const [ hubUrl, setHubUrl ] = React.useState<string | null>(isElectron() ? localStorage.getItem('workhub-api') : (process.env.NODE_ENV == "development" ? 'https://thetechcompany.workhub.services' || 'http://localhost:4002' : window.location.origin));
  return (
        <Router>
          <div className="App">
            <Route path="/" exact component={Login} />
            <Route path="/login" component={Login} />
            <Route path="/dashboard" render={(props) => {
              const token = localStorage.getItem('token')
              if(token && token.length > 0){
                return (
                      <WorkhubProvider token={token} url={hubUrl || ''}>
                        <Dashboard {...props} />
                      </WorkhubProvider>
                )
              }else{
                return (
                  <Redirect to="/login" />
                )
              }
            }} />
          </div>
        </Router>
  );
}

export default App;
