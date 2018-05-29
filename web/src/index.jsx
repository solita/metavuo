import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import App from './App';
import './favicon.png';
import ErrorBoundary from './ErrorBoundary';

const history = createBrowserHistory();

ReactDOM.render(
  (
    <ErrorBoundary>
      <Router history={history}>
        <App />
      </Router>
    </ErrorBoundary>
  ), document.getElementById('root'),
);
