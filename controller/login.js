const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username })

  const passwordCorrected =
    user === null ? false : await bcrypt.compare(body.password, user.passwordHash)

  if (!user || !passwordCorrected) {
    return response.status(401).json({ error: 'Invalid username or password.' })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }
  const token = jwt.sign(userForToken, process.env.SECRET)

  response.status(200).send({
    token: token,
    username: user.username,
    name: user.name,
  })
})

module.exports = loginRouter
