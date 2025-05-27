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


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}
