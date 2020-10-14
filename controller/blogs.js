const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  // TODO: seems only root user can get all blogs list.
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
    _id: 1,
  })
  response.json(blogs)
})

blogsRouter.post('/:id/comments', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  await User.findById(decodedToken.id)
  const id = request.params.id
  const blog = await Blog.findById(id)
  if (!blog) {
    return response.status(404).send({ error: 'blog not found' })
  }

  blog.comments = [...blog.comments, request.body.comment]
  const updateBlog = await Blog.findByIdAndUpdate(id, blog, {
    new: true,
    context: 'query',
  })
  response.json(updateBlog)
})

blogsRouter.post('/', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  const body = request.body
  const user = await User.findById(decodedToken.id)
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: typeof body.likes !== 'number' ? 0 : body.likes,
    user: user._id,
  })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  const id = request.params.id
  const blog = await Blog.findById(id)

  if (!blog) {
    return response.status(404).send({ error: 'blog not found' })
  }

  if (blog.user.toString() !== decodedToken.id.toString()) {
    return response
      .status(401)
      .json({ error: 'no permission: cannot delete blog' })
  }

  const user = await User.findById(blog.user)
  user.blogs = user.blogs.filter(
    (blog) => JSON.stringify(blog) !== JSON.stringify(id)
  )

  await user.save()
  await Blog.findByIdAndRemove(id)
  response.status(204).end()
})

// FIXME: 1. update user blog list
//        2. token authorization
blogsRouter.put('/:id', async (request, response) => {
  jwt.verify(request.token, process.env.SECRET)

  const id = request.params.id
  const body = request.body

  const blog = await Blog.findById(id)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  const blogObject = {
    likes: typeof body.likes === 'number' ? body.likes : 0,
  }

  const updateBlog = await Blog.findByIdAndUpdate(id, blogObject, {
    new: true,
    runValidators: true,
    context: 'query',
  })
  response.json(updateBlog)
})

module.exports = blogsRouter
