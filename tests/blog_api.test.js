const bcrypt = require('bcrypt')
const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially some blogs saved', () => {
  let token
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    const testUser = await user.save()

    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
    token = response.body.token

    await Blog.deleteMany({})
    const blogsToInsert = helper.initialBlogs.map(blog => ({
      ...blog,
      user: testUser._id
    }))
    await Blog.insertMany(blogsToInsert)
  })

  test('correct amount of blogs are returned as json', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('the blog identifier is named as id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    assert.ok(blogsAtStart[0].id)
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data', async () => {
      const newBlog = {
        _id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12,
        __v: 0
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(blog => blog.title)
      assert(titles.includes('Canonical string reduction'))
    })

    test('if likes is not set, it will default to 0', async () => {
      const noLikesBlog = {
        _id: 'a',
        title: 'Test title 1',
        author: 'Test Dude 1',
        url: 'http://test.com',
        __v: 1
      }

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(noLikesBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, 0)
    })

    test('fails with status code 400 if not fields title or url', async () => {
      const noUrlBlog = {
        _id: 'a',
        title: 'Test title 1',
        author: 'Test Dude 1',
        likes: 1,
        __v: 1
      }
      const noTitleBlog = {
        _id: 'b',
        author: 'Test Dude 2',
        url: 'http://test.com',
        likes: 2,
        __v: 2
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(noUrlBlog)
        .expect(400)
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(noTitleBlog)
        .expect(400)
    })
  })

  describe('updating of a blog', () => {
    const blogUpdate = {
      title: 'Updated Blog',
      author: 'Updater',
      url: 'http://update.com',
      likes: 99
    }

    test('updating blog succeeds if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blogUpdate)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, 99)
    })

    test('updating blog fails if id is invalid', async () => {
      await api
        .put(`/api/blogs/${helper.nonExistingId}`)
        .send(blogUpdate)
        .expect(400)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      const titles = blogsAtEnd.map(blog => blog.title)
      assert(!titles.includes(blogToDelete.title))

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })

    test('fails if id is not valid', async () => {
      await api
        .delete(`/api/blogs/${helper.nonExistingId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    })
  })
})

describe('when there is initially at least one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a valid username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'User_1',
      name: 'User One',
      password: 'secret_password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with correct statuscode and message if username already in use', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'secretsecret'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

    assert(result.body.error.includes('Expected `username` to be unique.'))
  })

  test('creation fails with correct statuscode and message if username too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ro',
      name: 'Superuser',
      password: 'secretsecret'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

    assert(result.body.error.includes(
      'User validation failed: username: Path `username` (`ro`) is shorter than the minimum allowed length (3).'
    ))
  })

  test('creation fails with correct statuscode and message if password too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'se'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

    assert(result.body.error.includes('Invalid username or password.'))
  })
})

after(async () => {
  await mongoose.connection.close()
})
