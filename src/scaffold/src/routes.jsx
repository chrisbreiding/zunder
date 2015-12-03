import React from 'react';
import { Router, Route } from 'react-router';

import App from './app/app';

export default (
  <Router>
    <Route path="/" component={App} />
  </Router>
);
