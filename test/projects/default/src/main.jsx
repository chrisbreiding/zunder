import { observable } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { render } from 'react-dom'

const nodeModuleExport = require('./node-module')

@observer
class App extends Component {
  @observable value = 'original'

  render () {
    const spreadMe = {
      object: 'object',
      spread: 'spread',
    }

    const spread = {
      ...spreadMe,
    }

    return (
      <div>
        <p className='object-spread'>{spread.object} {spread.spread}</p>
        <p className='node-module-export'>{nodeModuleExport}</p>
        <p className='env'>{process.env.MY_ENV_VAR} {process.env.NODE_ENV}</p>
        <p className='observable-value'>{this.value}</p>
        <input onChange={this._updateValue} />
      </div>
    )
  }

  _updateValue = (e) => {
    this.value = e.target.value
  }
}

render(<App />, document.getElementById('app'))
