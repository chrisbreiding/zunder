import React from 'react';
import { Router, Route } from 'react-router';

import App from './app/app';

const Root = (props) => props.children;

export default (
  <Router>
    <Route path="/" component={Root}>
      <Route path="/" component={App} />
    </Route>
  </Router>
);
