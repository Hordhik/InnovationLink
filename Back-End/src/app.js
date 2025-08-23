import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import routes from './routes/index.js'
import { errorHandler } from './middleware/error.middleware.js'

dotenv.config()

const app = express()

app.use(helmet())
app.use(morgan('dev'))
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'InnovationLink API' })
})

app.use('/api', routes)

// Central error handler
app.use(errorHandler)

export default app
