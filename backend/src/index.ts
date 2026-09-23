import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes'
import publicRoutes from './routes/public.routes'
import participantRoutes from './routes/participant.routes'
import hotelRoutes from './routes/hotel.routes'
import shadRoutes from './routes/shad.routes'
import allocationRoutes from './routes/allocation.routes'
import volunteerRoutes from './routes/volunteer.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin === frontendUrl) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/participants', participantRoutes)
app.use('/api/hotels', hotelRoutes)
app.use('/api/shads', shadRoutes)
app.use('/api/allocations', allocationRoutes)
app.use('/api/volunteers', volunteerRoutes)

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})
