const path = require('path');

const APP_PATH = path.resolve(__dirname, 'src');

module.exports = {
  entry: `${APP_PATH}/main.js`,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loaders: ['babel'], include: APP_PATH }
    ]
  }
};
