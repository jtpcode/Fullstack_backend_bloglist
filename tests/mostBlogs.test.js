const { test, describe } = require('node:test')
const assert = require('node:assert')

const mostBlogs = require('../utils/list_helper').mostBlogs
const { blogs } = require('../utils/bloglist')

describe('most blogs', () => {
  const expected = {
    author: 'Robert C. Martin',
    blogs: 3
  }

  test('with multiple blogs', () => {
    assert.deepStrictEqual(mostBlogs(blogs), expected)
  })
})
