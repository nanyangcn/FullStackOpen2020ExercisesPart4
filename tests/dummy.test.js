const listHelper = require('../utils/list_helper')

const blogs = listHelper.initialBlogs

describe('likes', () => {
  test('total likes', () => {
    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(36)
  })

  test('max likes', () => {
    const result = listHelper.favoriteBlog(blogs)
    expect(result).toEqual(blogs[2])
  })
})

describe('blogs', () => {
  test('most blogs', () => {
    const result = listHelper.mostBlogs(blogs)
    const mostBlogs = {
      author: 'Robert C. Martin',
      blogs: 3,
    }
    expect(result).toEqual(mostBlogs)
  })
})

describe('favorite author', () => {
  test('most like author', () => {
    const result = listHelper.mostLike(blogs)
    const mostLikes = {
      author: 'Edsger W. Dijkstra',
      likes: 17,
    }
    expect(result).toEqual(mostLikes)
  })
})