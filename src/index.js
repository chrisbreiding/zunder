module.exports = (gulp, config = {}) => {
  config.srcFile = config.srcFile || 'main.jsx';
  require('fs')
    .readdirSync(`${__dirname}/tasks/`)
    .forEach(task => {
      require(`${__dirname}/tasks/${task}`)(gulp, config);
    });
};
