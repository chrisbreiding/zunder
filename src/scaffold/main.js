import { render, createFactory } from 'react';
import { create as createRouter } from 'react-router';
import routes from './routes';

const router = createRouter({ routes: routes });

router.run((Handler, state) => {
  render(createFactory(Handler)(), document.getElementById('app'));
});
