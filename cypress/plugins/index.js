const execa = require('execa')
const glob = require('glob')
const path = require('path')

const tasksRun = {}

const zunderPath = path.join(__dirname, '..', '..', 'src', 'lib', 'zunder.js')
const getProjectDir = (project) => {
  return path.join(__dirname, '..', '..', 'test', 'projects', project)
}

module.exports = (on) => {
  on('task', {
    'zunder' ({ task, project, args = '', force = false }) {
      if (!force && tasksRun[`${task}${project}`]) return null

      const cwd = getProjectDir(project)
      return execa.shell(`node ${zunderPath} ${task} ${args}`, { cwd, stdio: 'inherit' }).then(() => {
        tasksRun[`${task}${project}`] = true
        return null
      })
    },

    'zunder:test' () {
      return execa.shell(`node ${zunderPath} test`, {
        cwd: getProjectDir('default'),
      })
    },

    'list:files' (globPattern) {
      const files = glob.sync(path.join(process.cwd(), globPattern))
      return files.map((file) => {
        return file.replace(`${path.dirname(file)}${path.sep}`, '')
      })
    },
  })
}
