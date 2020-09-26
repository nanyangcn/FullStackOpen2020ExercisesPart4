const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

// usersRouter.get('/', async (request, response) => {
//   const users = await User.find({})
//   response.json(users)
// })
usersRouter.get('/', async (request, response) => {
  // TODO: seems only root user can get all users
  const users = await User.find({}).populate('blogs', {
    title: 1,
    author: 1,
    url: 1,
    _id: 1,
  })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.password) {
    return response.status(400).json({ error: 'password cannot be empty' })
  }
  if (body.password.length < 3) {
    return response.status(400).json({ error: 'password must be at least 3 characters' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const newUser = new User({
    username: body.username,
    name: body.name,
    passwordHash: passwordHash,
    blogs: [],
  })

  const savedUser = await newUser.save()
  response.json(savedUser)
})

// TODO: add userRouter.put() to make users can modify their password, username, and name.

// TODO: add userRouter.delete() to make users to delete their account.

module.exports = usersRouter
