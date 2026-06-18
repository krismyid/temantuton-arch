import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { healthRoute } from './routes/health'

const app = new Hono()

app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

app.route('/health', healthRoute)

export default app
