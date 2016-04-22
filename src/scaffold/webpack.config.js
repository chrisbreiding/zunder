const path = require('path');

const APP_PATH = path.resolve(__dirname, 'src');

module.exports = {
  entry: `${APP_PATH}/main.jsx`,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        loader: 'babel',
        test: /\.jsx?$/,
        include: APP_PATH,
        query: {
          presets: ['react', 'es2015']
        }
      }
    ]
  }
};
