const fp = require('lodash/fp')
const Blog = require('../models/blog')

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
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url:
      'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html',
    likes: 10,
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
  },
]

const newBlog = {
  title: 'Blog List',
  author: 'Yang Nan',
  url: 'https://google.com/',
  likes: 7,
}

const newBlogNoLikes = {
  title: 'Blog No Like',
  author: 'No Like',
  url: 'https://no-like.com/',
}

const newBlogNoTitle = {
  author: 'No Title',
  url: 'https://no-title.com/',
  likes: 7,
}

const newBlogNoUrl = {
  title: 'Blog No Url',
  author: 'No Url',
  likes: 7,
}

const BlogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
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
  BlogsInDb,
}
