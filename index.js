const express = require('express')
const cors = require('cors')
const multer = require('multer')
const app = express()
const fileService = require('./fileService')

const port = process.env.PORT || 3000

const createHttpContext = (req, _res, next) => {
  try {
    req.context = {
      requestBody: req?.body,
      param: {
        ...req?.params,
        ...req?.query,
        ...req?.headers,
      },
      method: req.method,
      language: req.headers['accept-language'],
      software: req.headers['sec-ch-ua'],
      origin: req.headers?.origin,
      file: req.file,
    }
    next()
  } catch (error) {
    next(error)
  }
}

const pipeMiddleware = (...middlewares) => {
  const router = express.Router({ mergeParams: true })
  middlewares.forEach(m => router.use(m))
  return router
}

const upload = multer()
const serviceUploadFileHandler = (handler) => pipeMiddleware(upload.single('upfile'), createHttpContext, async (req, res, next) => {
  try {
    const data = await handler(req.context)
    res.status(200).send(data)
    next()
  } catch (error) {
    next(error)
  }
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/public', express.static(`${process.cwd()}/public`))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' })
})
app.post('/api/fileanalyse', serviceUploadFileHandler(fileService.handleUploadFile))

app.use((error, _req, res, _next) => {
  if (error) {
    console.log({ error })
    res
      .status(error.status || 500)
      .send(error?.message ? { error: error.message } : error)
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`)
})
