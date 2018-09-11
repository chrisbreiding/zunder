import React from 'react'
import { render } from 'react-dom'

import fromCoffee from './lib.coffee'

const App = () => (
  <div>
    <div className='from-coffee'>{fromCoffee()}</div>
  </div>
)

render(<App />, document.getElementById('app'))
