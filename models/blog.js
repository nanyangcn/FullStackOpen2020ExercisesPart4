const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: {
    required: true,
    type: String,
  },
  author: String,
  url: {
    required: true,
    type: String,
  },
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  comments: [
    {
      type: String,
    },
  ],
})

blogSchema.set('toJSON', {
  transform: (document, returnObject) => {
    returnObject.id = returnObject._id
    delete returnObject._id
    delete returnObject.__v
  },
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
