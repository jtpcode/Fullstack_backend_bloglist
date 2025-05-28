const _ = require('lodash')

const dummy = (blogs) => {
  if (blogs) {
    return 1
  }
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (favBlog, blog) => {
    if (blog.likes > favBlog.likes) {
      return blog
    }
    return favBlog
  }

  return blogs.reduce(reducer)
}

const mostBlogs = (blogs) => {
  const counts = _.countBy(blogs, (blog) => blog.author)
  const maxBlogger = _.maxBy(Object.entries(counts), (c) => c[1])

  return { author: maxBlogger[0], blogs: maxBlogger[1] }
}

const mostLikes = (blogs) => {
  const grouped = _.groupBy(blogs, 'author')

  const summed = _.map(grouped, (authorBlogs, author) => ({
    author: author,
    likes: _.sumBy(authorBlogs, 'likes')
  }))

  return _.maxBy(summed, 'likes')
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
