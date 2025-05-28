const { test, describe } = require('node:test')
const assert = require('node:assert')

const mostLikes = require('../utils/list_helper').mostLikes
const { blogs } = require('../utils/bloglist')

describe('most likes', () => {
  const expected = {
    author: 'Edsger W. Dijkstra',
    likes: 17
  }

  test('with multiple blogs', () => {
    assert.deepStrictEqual(mostLikes(blogs), expected)
  })
})
