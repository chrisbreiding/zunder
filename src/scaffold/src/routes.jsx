import React, { createClass } from 'react';
import { Router, Route, Redirect } from 'react-router';

import App from './app/app';

const Root = createClass({ render () { return this.props.children; } });

export default (
  <Router>
    <Redirect from="/" to="/app" />
    <Route path="/" component={Root}>
      <Route path="/app" component={App} />
    </Route>
  </Router>
);
