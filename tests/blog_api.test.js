const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const listHelper = require('../utils/list_helper')

const api = supertest(app)
const initialBlogs = listHelper.initialBlogs

beforeEach(async () => {
  await Blog.deleteMany({})

  const newBlogs = initialBlogs.map((blog) => new Blog(blog))
  const promisesBlogs = newBlogs.map((blog) => blog.save())
  await Promise.all(promisesBlogs)
})

describe('get', () => {
  test('get status type', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('get length', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
  })

  test('get author', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach((blog) => expect(blog.id).toBeDefined())
  })
})

describe('post', () => {
  test('post status type', async () => {
    const newBlog = listHelper.newBlog
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })

  test('post length', async () => {
    const newBlog = listHelper.newBlog
    await api.post('/api/blogs').send(newBlog)

    const blogs = await listHelper.BlogsInDb()
    expect(blogs).toHaveLength(initialBlogs.length + 1)
  })

  test('post body', async () => {
    const newBlog = listHelper.newBlog
    await api.post('/api/blogs').send(newBlog)

    const blogs = await listHelper.BlogsInDb()
    blogs.forEach((blog) => delete blog.id)
    expect(blogs).toContainEqual(newBlog)
  })

  test('post like', async () => {
    const newBlogNoLikes = listHelper.newBlogNoLikes
    await api.post('/api/blogs').send(newBlogNoLikes)

    const blogs = await listHelper.BlogsInDb()
    blogs.forEach((blog) => expect(blog.likes).toBeDefined())
  })

  test('test no title', async () => {
    const newBlogNoTitle = listHelper.newBlogNoTitle
    await api.post('/api/blogs').send(newBlogNoTitle).expect(400)
  })

  test('test no url', async () => {
    const newBlogNoUrl = listHelper.newBlogNoUrl
    await api.post('/api/blogs').send(newBlogNoUrl).expect(400)
  })
})

describe('delete', () => {
  test('delete status', async () => {
    const blogs = await listHelper.BlogsInDb()
    const id = blogs[0].id
    await api.delete(`/api/blogs/${id}`).expect(204)
  })

  test('delete length', async () => {
    const blogsBefore = await listHelper.BlogsInDb()
    const lengthBefore = blogsBefore.length
    const id = blogsBefore[0].id
    await api.delete(`/api/blogs/${id}`)
    const blogsAfter = await listHelper.BlogsInDb()
    expect(blogsAfter).toHaveLength(lengthBefore - 1)
  })

  test('delete body', async () => {
    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    await api.delete(`/api/blogs/${id}`)
    const blogsAfter = await listHelper.BlogsInDb()
    expect(blogsAfter).not.toContainEqual(blogsBefore[0])
  })
})

describe('put', () => {
  test('put status type', async () => {
    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    const updateBlog = listHelper.newBlog
    await api
      .put(`/api/blogs/${id}`)
      .send(updateBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  test('put length', async () => {
    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    const updateBlog = listHelper.newBlog
    await api.put(`/api/blogs/${id}`).send(updateBlog)
    const blogsAfter = await listHelper.BlogsInDb()
    expect(blogsAfter).toHaveLength(blogsBefore.length)
  })

  test('put body', async () => {
    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    const updateBlog = listHelper.newBlog
    await api.put(`/api/blogs/${id}`).send(updateBlog)
    const blogsAfter = await listHelper.BlogsInDb()
    blogsAfter.forEach((blog) => delete blog.id)
    expect(blogsAfter).toContainEqual(updateBlog)
  })

  test('put no like', async () => {
    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    const updateBlog = listHelper.newBlogNoLikes
    await api.put(`/api/blogs/${id}`).send(updateBlog)
    const blogsAfter = await listHelper.BlogsInDb()
    blogsAfter.forEach((blog) => expect(blog.likes).toBeDefined())
  })

  test('put no title', async () => {
    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    const updateBlog = listHelper.newBlogNoTitle
    await api.put(`/api/blogs/${id}`).send(updateBlog).expect(400)
  })

  test('put no url', async () => {
    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    const updateBlog = listHelper.newBlogNoUrl
    await api.put(`/api/blogs/${id}`).send(updateBlog).expect(400)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
