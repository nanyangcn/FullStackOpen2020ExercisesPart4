const fp = require('lodash/fp')
const Blog = require('../models/blog')
const User = require('../models/user')

const totalLikes = (blogs) => {
  const likes = blogs.map((blog) => blog.likes)
  return likes.reduce((total, like) => total + like)
}

const favoriteBlog = (blogs) => {
  const likes = blogs.map((blog) => blog.likes)
  const indexMaxLikes = likes.indexOf(Math.max(...likes))
  return blogs[indexMaxLikes]
}

const mostBlogs = (blogs) => {
  const authorsAndCounts = fp.countBy('author')(blogs)
  const counts = Object.values(authorsAndCounts)
  const maxCount = Math.max(...counts)
  const indexMaxCount = counts.indexOf(maxCount)
  const authors = Object.keys(authorsAndCounts)

  return {
    author: authors[indexMaxCount],
    blogs: maxCount,
  }
}

const mostLike = (blogs) => {
  const authorsAndObjects = fp.groupBy('author')(blogs)
  const objectEveryAuthor = Object.values(authorsAndObjects)
  const likes = objectEveryAuthor.map((object) => totalLikes(object))
  const maxLike = Math.max(...likes)
  const indexMaxLike = likes.indexOf(maxLike)
  const authors = Object.keys(authorsAndObjects)

  return {
    author: authors[indexMaxLike],
    likes: maxLike,
  }
}

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    id: 0,
    // user: 10,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url:
      'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    id: 1,
    // user: 11,
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    id: 2,
    // user: 11,
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html',
    likes: 10,
    id: 3,
    // user: 10,
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    id: 4,
    // user: 10,
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    id: 5,
    // user: 10,
  },
]

const userIndex = [0, 1, 1, 0, 0, 0]
const blogIndex = [
  [0, 3, 4, 5],
  [1, 2],
]

const newBlog = {
  title: 'Blog List',
  author: 'Yang Nan',
  url: 'https://google.com/',
  likes: 7,
  id: 6,
}

const newBlogNoLikes = {
  title: 'Blog No Like',
  author: 'No Like',
  url: 'https://no-like.com/',
  id: 6,
}

const newBlogNoTitle = {
  author: 'No Title',
  url: 'https://no-title.com/',
  likes: 7,
  id: 6,
}

const newBlogNoUrl = {
  title: 'Blog No Url',
  author: 'No Url',
  likes: 7,
  id: 6,
}

const initialUsers = [
  {
    username: 'qwert',
    name: 'Qwert',
    password: '123456',
    blogs: [0, 3, 4, 5],
    id: 10,
  },
  {
    username: 'poiuy',
    name: 'Poiuy',
    password: '654321',
    blogs: [1, 2],
    id: 11,
  },
]

const newUser = {
  username: 'abcde',
  name: 'Abcde',
  password: 'abc123',
  id: 12,
}

const newUserNoUsername = {
  name: 'No Username',
  password: 'noUsername',
  id: 12,
}

const newUserUniqueUsername = {
  username: 'qwert',
  name: 'Qwert123',
  password: '123456123',
  id: 12,
}

const newUserNoPassword = {
  username: 'noPassword',
  name: 'No Password',
  id: 12,
}

const newUserShortPassword = {
  username: 'shortPassword',
  name: 'Short Password',
  password: '1',
  id: 12,
}

const BlogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const UsersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLike,
  initialBlogs,
  newBlog,
  newBlogNoLikes,
  newBlogNoTitle,
  newBlogNoUrl,
  userIndex,
  blogIndex,
  initialUsers,
  newUser,
  newUserNoUsername,
  newUserUniqueUsername,
  newUserNoPassword,
  newUserShortPassword,
  BlogsInDb,
  UsersInDb,
}
