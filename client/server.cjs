const express = require('express')
const url = require('url')
const http = require('http')

const app = express()

backendUrl = process.env.BACKEND_URL || `http://backend:8000`
port = process.env.PORT || 8000

// simple static server to host the vue app
app.use(express.static('dist'))

// backend api redirection
app.get('/api*', async (req, res, next) => {
  const parsedReqUrl = url.parse(req.url, true)
  const newPath = parsedReqUrl.path.replace('/api', '')
  try {
    const backendParsedUrl = url.parse(backendUrl, false)
    console.log(
      `Doing request to backend ${backendParsedUrl.protocol}://${backendParsedUrl.hostname}:${backendParsedUrl.port}${newPath}`
    )
    const http_client = http
      .request(
        {
          host: backendParsedUrl.hostname,
          path: newPath,
          port: backendParsedUrl.port,
          headers: req.headers,
          body: req.body
        },
        (resp) => {
          res.writeHead(resp.statusCode, resp.headers)
          resp.pipe(res)
        }
      )
      .on('error', (error) => {
        console.log(`Got error ${error}`)
        res.status(500).json({ error: `${error}` })
        next(error)
      })
    req.pipe(http_client)
  } catch (error) {
    console.log(`Got error ${error}`)
    next(error)
  }
})

app.listen(port, () => {
  console.log(`Server running at http://0.0.0.0:${port}`)
  console.log(`  Using backend url: ${backendUrl}`)
})
