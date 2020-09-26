const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const User = require('../models/user')
const Blog = require('../models/blog')
const listHelper = require('../utils/list_helper')

const api = supertest(app)
const initialUsers = listHelper.initialUsers
const initialBlogs = listHelper.initialBlogs
const userIndex = listHelper.userIndex

beforeEach(async () => {
  const saveBlogs = async () => {
    await Blog.deleteMany({})
    for (const blog of initialBlogs) {
      const newBlog = new Blog(blog)
      await newBlog.save()
    }
  }

  const saveUsersWithBlogs = async () => {
    const blogs = await Blog.find({})
    await User.deleteMany({})
    const blogsArray = []
    for (let i = 0; i < initialUsers.length; i++) {
      blogsArray[i] = []
    }
    blogs.forEach((blog, i) => {
      blogsArray[userIndex[i]].push(blog._id)
    })
    for (const [i, user] of initialUsers.entries()) {
      const passwordHash = await bcrypt.hash(user.password, 10)
      const newUser = new User({
        name: user.name,
        username: user.username,
        passwordHash: passwordHash,
        blogs: blogsArray[i],
      })
      await newUser.save()
    }
  }

  await saveBlogs()
  await saveUsersWithBlogs()
})

describe('get users', () => {
  test('get users status type', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('get users length', async () => {
    const response = await api.get('/api/users')
    expect(response.body).toHaveLength(initialUsers.length)
  })

  test('get users body', async () => {
    const response = await api.get('/api/users')
    const usernames = response.body.map((user) => user.username)

    expect(usernames).toEqual(initialUsers.map((user) => user.username))
  })

  test('get users blogs', async () => {
    const response = await api.get('/api/users')
    const usersPrimitive = await listHelper.UsersInDb()
    for (const [i, user] of response.body.entries()) {
      const blogsId = user.blogs.map((blog) => blog.id)
      const Ids = usersPrimitive[i].blogs
      expect(JSON.stringify(blogsId)).toEqual(JSON.stringify(Ids))
    }
  })
})

describe('post user', () => {
  test('post user status type', async () => {
    const newUser = listHelper.newUser
    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('post user length', async () => {
    const newUser = listHelper.newUser
    await api.post('/api/users').send(newUser)

    const users = await listHelper.UsersInDb()
    expect(users).toHaveLength(initialUsers.length + 1)
  })

  test('post user body', async () => {
    const newUser = listHelper.newUser
    await api.post('/api/users').send(newUser)

    const users = await listHelper.UsersInDb()
    const usernames = users.map((user) => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('post no username', async () => {
    const newUser = listHelper.newUserNoUsername
    const response = await api.post('/api/users').send(newUser).expect(400)
    expect(response.error.text).toEqual(
      '{"error":"User validation failed: username: Path `username` is required."}'
    )
  })

  test('post unique username', async () => {
    const newUser = listHelper.newUserUniqueUsername
    const response = await api.post('/api/users').send(newUser).expect(400)
    expect(response.error.text).toEqual(
      '{"error":"User validation failed: username: Error, expected `username` to be unique. Value: `qwert`"}'
    )
  })

  test('post no password', async () => {
    const newUser = listHelper.newUserNoPassword
    const response = await api.post('/api/users').send(newUser).expect(400)
    expect(response.error.text).toEqual('{"error":"password cannot be empty"}')
  })

  test('post short password', async () => {
    const newUser = listHelper.newUserShortPassword
    const response = await api.post('/api/users').send(newUser).expect(400)
    expect(response.error.text).toEqual(
      '{"error":"password must be at least 3 characters"}'
    )
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
