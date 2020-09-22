const fp = require('lodash/fp')

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
module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLike,
}
