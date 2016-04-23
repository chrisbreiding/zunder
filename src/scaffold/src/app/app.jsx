import React, { Component } from 'react';

export default class extends Component {
  constructor (props) {
    super(props);

    this.state = {
      greeting: 'Hello',
      name: 'World',
    };
  }

  render () {
    return (
      <main style={{ padding: '20px', fontSize: '20px', textAlign: 'center' }}>
        <h1>{this.state.greeting} {this.state.name}!</h1>
        <p style={{ margin: '20px', fontSize: '40px' }}>
          <i className='fa fa-smile-o'></i>{' '}
          <i className='fa fa-heart-o'></i>{' '}
          <i className='fa fa-beer'></i>
        </p>
        <button
          style={{
            background: '#333',
            border: 'none',
            borderRadius: '3px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '20px',
            padding: '10px',
          }}
          onClick={this._getData.bind(this)}
        >Update</button>
      </main>
    );
  }

  _getData () {
    fetch('/api/data')
      .then(response => response.json())
      .then(data => this.setState(data));
  }
}
