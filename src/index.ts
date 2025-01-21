import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, verify, sign } from 'hono/jwt'
import { userRouter } from './routes/user'
import { postRouter } from './routes/post'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}>()

app.get('/' , (c)=> {
  return c.text("this is working")
})

//routers
app.route('/api/v1/user' , userRouter)
app.route('/api/v1/post', postRouter)

export default app

