const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const listHelper = require('../utils/list_helper')

const api = supertest(app)
const initialBlogs = listHelper.initialBlogs
const initialUsers = listHelper.initialUsers
const userIndex = listHelper.userIndex

beforeEach(async () => {
  const saveUsers = async () => {
    await User.deleteMany({})
    for (const user of initialUsers) {
      const passwordHash = await bcrypt.hash(user.password, 10)
      const newUser = new User({
        name: user.name,
        username: user.username,
        passwordHash: passwordHash,
      })
      await newUser.save()
    }
  }

  const saveBlogsWithUser = async () => {
    const users = await User.find({})
    await Blog.deleteMany({})
    initialBlogs.forEach((blog, i) => {
      blog.user = users[userIndex[i]]._id
    })
    for (const blog of initialBlogs) {
      const newBlog = new Blog(blog)
      await newBlog.save()
    }
  }

  const saveUsersWithBlogs = async () => {
    const blogs = await Blog.find({})
    const users = await User.find({})

    const blogsArray = []
    for (let i = 0; i < initialUsers.length; i++) {
      blogsArray[i] = []
    }
    blogs.forEach((blog, i) => {
      blogsArray[userIndex[i]].push(blog._id)
    })

    for (const [i, user] of users.entries()) {
      user.blogs = blogsArray[i]
      await user.save()
    }
  }

  await saveUsers()
  await saveBlogsWithUser()
  await saveUsersWithBlogs()
})

describe('get blog', () => {
  test('get blog status type', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('get blog length', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
  })

  test('get blog id', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach((blog) => expect(blog.id).toBeDefined())
  })

  test('get blog user', async () => {
    const response = await api.get('/api/blogs')
    for (const blog of response.body) {
      const blogPrimitive = await Blog.findById(blog.id)
      const user = await User.findById(blogPrimitive.user)
      expect(blog.user.username).toEqual(user.username)
    }
  })
})

describe('post blog', () => {
  test('post blog status type', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)

    const users = await User.find({})
    const newBlog = { ...listHelper.newBlog, user: users[0]._id }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })

  test('post blog length', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)
    const users = await User.find({})
    const newBlog = { ...listHelper.newBlog, user: users[0]._id }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(newBlog)

    const blogs = await listHelper.BlogsInDb()
    expect(blogs).toHaveLength(initialBlogs.length + 1)
  })

  test('post blog body', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)
    const users = await User.find({})
    const newBlog = { ...listHelper.newBlog, user: users[0]._id }
    delete newBlog.id
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(newBlog)

    const blogs = await listHelper.BlogsInDb()
    blogs.forEach((blog) => delete blog.id)
    expect(blogs).toContainEqual(newBlog)
  })

  test('post blog like', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)
    const users = await User.find({})
    const newBlogNoLikes = { ...listHelper.newBlogNoLikes, user: users[0]._id }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(newBlogNoLikes)

    const blogs = await listHelper.BlogsInDb()
    blogs.forEach((blog) => expect(blog.likes).toBeDefined())
  })

  test('post blog no title', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)
    const users = await User.find({})
    const newBlogNoTitle = { ...listHelper.newBlogNoTitle, user: users[0]._id }
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(newBlogNoTitle)
      .expect(400)
    expect(response.error.text).toBe(
      '{"error":"Blog validation failed: title: Path `title` is required."}'
    )
  })

  test('post blog no url', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)
    const users = await User.find({})
    const newBlogNoUrl = { ...listHelper.newBlogNoUrl, user: users[0]._id }
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(newBlogNoUrl)
      .expect(400)
    expect(response.error.text).toBe(
      '{"error":"Blog validation failed: url: Path `url` is required."}'
    )
  })

  test('post blog user', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)
    const users = await User.find({})
    const newBlog = { ...listHelper.newBlog, user: users[0]._id }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(newBlog)

    const usersAfter = await User.find({})
    expect(usersAfter[0].blogs.length).toBe(users[0].blogs.length + 1)
  })

  test('post blog without token', async () => {
    const users = await User.find({})
    const newBlog = { ...listHelper.newBlog, user: users[0]._id }
    const response = await api.post('/api/blogs').send(newBlog).expect(401)
    expect(response.error.text).toBe('{"error":"token missing or invalid"}')
  })
})

describe('delete blog', () => {
  test('delete blog status', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)

    const blogs = await listHelper.BlogsInDb()
    const id = blogs[0].id
    await api
      .delete(`/api/blogs/${id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .expect(204)
  })

  test('delete blog length', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)

    const blogsBefore = await listHelper.BlogsInDb()
    const lengthBefore = blogsBefore.length
    const id = blogsBefore[0].id
    await api
      .delete(`/api/blogs/${id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
    const blogsAfter = await listHelper.BlogsInDb()
    expect(blogsAfter).toHaveLength(lengthBefore - 1)
  })

  test('delete blog body', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)

    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    await api
      .delete(`/api/blogs/${id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
    const blogsAfter = await listHelper.BlogsInDb()
    expect(blogsAfter).not.toContainEqual(blogsBefore[0])
  })
})

describe('put blog', () => {
  test('put blog status type', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)

    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    const users = await listHelper.UsersInDb()
    const updateBlog = { ...listHelper.newBlog, user: users[0].id }
    await api
      .put(`/api/blogs/${id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(updateBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('put blog length', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)

    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    const users = await listHelper.UsersInDb()
    const updateBlog = { ...listHelper.newBlog, user: users[0].id }
    await api
      .put(`/api/blogs/${id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(updateBlog)
    const blogsAfter = await listHelper.BlogsInDb()
    expect(blogsAfter).toHaveLength(blogsBefore.length)
  })

  test('put blog body', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)

    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    const users = await listHelper.UsersInDb()
    const updateBlog = { ...listHelper.newBlog, user: users[0].id }
    delete updateBlog.id
    await api
      .put(`/api/blogs/${id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(updateBlog)
    const blogsAfter = await listHelper.BlogsInDb()
    blogsAfter.forEach((blog) => {
      delete blog.id
    })
    expect(blogsAfter).toContainEqual(updateBlog)
  })

  test('put blog no like', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)

    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    const users = await listHelper.UsersInDb()
    const updateBlog = { ...listHelper.newBlogNoLikes, user: users[0].id }
    await api
      .put(`/api/blogs/${id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(updateBlog)
    const blogsAfter = await listHelper.BlogsInDb()
    blogsAfter.forEach((blog) => expect(blog.likes).toBeDefined())
  })

  test('put blog no title', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)

    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    const users = await listHelper.UsersInDb()
    const updateBlog = { ...listHelper.newBlogNoTitle, user: users[0].id }
    const response = await api
      .put(`/api/blogs/${id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(updateBlog)
      .expect(400)
    expect(response.error.text).toBe(
      '{"error":"Validation failed: title: Path `title` is required."}'
    )
  })

  test('put blog no url', async () => {
    const loginUser = {
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    }
    const loginResponse = await api.post('/api/login').send(loginUser)

    const blogsBefore = await listHelper.BlogsInDb()
    const id = blogsBefore[0].id
    const users = await listHelper.UsersInDb()
    const updateBlog = { ...listHelper.newBlogNoUrl, user: users[0].id }
    const response = await api
      .put(`/api/blogs/${id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(updateBlog)
      .expect(400)
    expect(response.error.text).toBe(
      '{"error":"Validation failed: url: Path `url` is required."}'
    )
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
