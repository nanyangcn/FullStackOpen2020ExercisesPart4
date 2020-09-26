const listHelper = require('../utils/list_helper')

const blogs = listHelper.initialBlogs

describe('blog likes', () => {
  test('total blog likes', () => {
    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(36)
  })

  test('blog max likes', () => {
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

describe('blog favorite author', () => {
  test('blog most like author', () => {
    const result = listHelper.mostLike(blogs)
    const mostLikes = {
      author: 'Edsger W. Dijkstra',
      likes: 17,
    }
    expect(result).toEqual(mostLikes)
  })
})
