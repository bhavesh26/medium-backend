import {  PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const postRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  }, 
  Variables : {
    userId: string
  }
}>();

postRouter.use("/*", async(c, next) => {
  const token  = c.req.header('authorization')
  if(!token){
    c.status(400)
    return c.text("token in missing")
  }
  const user =  await verify(token , c.env.JWT_SECRET)
  if(user){
    c.set("userId" , user.id as string) 
     await next();
  }
  else{
    c.status(400)
    return c.json({
      message : "not a valid token"
    })
  }

  
});

postRouter.get('/myblogs' , async(c)=> {
  const userId = c.get("userId")
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try{
    const posts = await prisma.post.findMany({
      where : {
        authorId : userId
      }
    })
    return c.json({
      posts
    })
  }
  catch(e){
    c.status(411)
    return c.text("error fetching post")
  }

})

postRouter.post("/", async (c) => {
  const body = await c.req.json();
  const userId = c.get('userId')
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
    });
    return c.json({
      id: post.id,
    });
  } catch (err) {
    c.status(500);
    return c.json({
      message: err,
    });
  }
});
postRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const userId = c.get("userId")
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const post = await prisma.post.update({
      where: {
        id: id,
      },
      data: {
        title: body.title,
        content: body.content,
        authorId: userId
      },
    });
    return c.json({
      post
    });
  } catch (err) {
    c.status(500);
    return c.json({
      message: err,
    });
  }
});
postRouter.get("/bulk", async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try{
    const post = await prisma.post.findMany()
    return c.json({
      post
    })
  }
  catch(e){
    c.status(411)
    return c.text("error while fetching post")
  }
  
});
postRouter.get("/:id", async(c) => {
  const id  = c.req.param('id')
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try{
    const blog = await prisma.post.findFirst({
      where : {
        id : id
      }
    })
     return c.json({
      blog
     })
  }
  catch(err){
    c.status(411)
    return c.text("error while fetching documents")
  }
  
});

