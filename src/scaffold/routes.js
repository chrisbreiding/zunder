import { createFactory, createClass } from 'react';
import Router from 'react-router';

import AppComponent from './app/app';

const Route = createFactory(Router.Route);
const RouteHandler = createFactory(Router.RouteHandler);

const RootComponent = createClass({ render () { return RouteHandler(this.props); } });

export default Route({ handler: RootComponent, path: '/' },
  Route({ name: 'menu', handler: AppComponent, path: '/' }
);
