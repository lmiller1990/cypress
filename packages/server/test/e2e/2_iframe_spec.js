/* eslint-disable
    brace-style,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const Fixtures = require('../support/helpers/fixtures')
const e2e = require('../support/helpers/e2e').default

const e2ePath = Fixtures.projectPath('e2e')

const onServer = function (app) {
  app.use(bodyParser.json())

  app.get('/', (req, res) => {
    return res.send('<html>outer content<iframe src=\'/iframe\'></iframe></html>')
  })

  app.get('/500', (req, res) => {
    return res.send('<html>outer content<iframe src=\'/iframe_500\'></iframe></html>')
  })

  app.get('/sync_iframe', (req, res) => {
    return res.send(`\
<html>
outer contents
<iframe src='/timeout'></iframe>
</html>\
`)
  })

  app.get('/insert_iframe', (req, res) => {
    return res.send(`\
<html>
<script type='text/javascript'>
  window.insert = function(){
    var i = document.createElement("iframe")
    i.src = "/timeout"
    document.body.appendChild(i)
  }
</script>
<button onclick='insert()'>insert iframe</button>
</html>\
`)
  })

  app.get('/origin', (req, res) => {
    return res.send('<html>outer content<iframe src=\'http://www.bar.com/simple\'></iframe></html>')
  })

  app.get('/cross', (req, res) => {
    return res.send('<html>outer content<iframe src=\'http://www.bar.com:1616/simple\'></iframe></html>')
  })

  app.get('/simple', (req, res) => {
    return res.send('<html>simple</html>')
  })

  app.get('/iframe', (req, res) => // send the iframe contents
  {
    return res.sendFile(path.join(e2ePath, 'static', 'iframe', 'index.html'))
  })

  app.get('/iframe_500', (req, res) => {
    return res.status(500).sendFile(path.join(e2ePath, 'static', 'iframe', 'index.html'))
  })

  return app.get('/timeout', (req, res) => {
    return setTimeout(() => {
      return res.send('<html>timeout</html>')
    }
    , 2000)
  })
}

describe('e2e iframes', () => {
  e2e.setup({
    servers: {
      port: 1616,
      onServer,
    },
  })

  return e2e.it('passes', {
    spec: 'iframe_spec.coffee',
    snapshot: true,
    config: {
      hosts: {
        '*.foo.com': '127.0.0.1',
        '*.bar.com': '127.0.0.1',
      },
    },
  })
})