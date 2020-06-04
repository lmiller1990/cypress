/* eslint-disable
    no-console,
    no-unused-vars,
    prefer-rest-params,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs-extra')
const path = require('path')
const chokidar = require('chokidar')

const root = path.join(__dirname, '..', '..', '..')
const projects = path.join(root, 'test', 'support', 'fixtures', 'projects')
const tmpDir = path.join(root, '.projects')

// copy contents instead of deleting+creating new file, which can cause
// filewatchers to lose track of toFile.
const copyContents = (fromFile, toFile) => {
  return Promise.all([
    fs.open(toFile, 'w'),
    fs.readFile(fromFile),
  ])
  .then(([toFd, fromFileBuf]) => {
    return fs.write(toFd, fromFileBuf)
    .finally(() => {
      return fs.close(toFd)
    })
  })
}

module.exports = {
  // copies all of the project fixtures
  // to the tmpDir .projects in the root
  scaffold () {
    return fs.copySync(projects, tmpDir)
  },

  scaffoldWatch () {
    let w
    const watchdir = path.resolve(__dirname, '../fixtures/projects')

    console.log('watching files due to --no-exit', watchdir)

    w = chokidar.watch(watchdir, {
    })
    .on('change', (srcFilepath, stats) => {
      const tmpFilepath = path.join(tmpDir, path.relative(watchdir, srcFilepath))

      return copyContents(srcFilepath, tmpFilepath)
    }).on('error', console.error)
  },

  // removes all of the project fixtures
  // from the tmpDir .projects in the root
  remove () {
    return fs.removeSync(tmpDir)
  },

  // returns the path to project fixture
  // in the tmpDir
  project () {
    return this.projectPath.apply(this, arguments)
  },

  projectPath (name) {
    return path.join(tmpDir, name)
  },

  get (fixture, encoding = 'utf8') {
    return fs.readFileSync(path.join(root, 'test', 'support', 'fixtures', fixture), encoding)
  },

  path (fixture) {
    return path.join(root, 'test', 'support', 'fixtures', fixture)
  },
}