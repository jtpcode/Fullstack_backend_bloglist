const { test, describe } = require('node:test')
const assert = require('node:assert')

const favoriteBlog = require('../utils/list_helper').favoriteBlog
const { blogs } = require('../utils/bloglist')

describe('favorite blog', () => {
  const expected = {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  }

  test('with multiple blogs', () => {
    assert.deepStrictEqual(favoriteBlog(blogs), expected)
  })
})
