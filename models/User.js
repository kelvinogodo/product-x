import mongoose from 'mongoose'

export default (mongoose.models.User ?? mongoose.model('User',
mongoose.Schema({
  email: {
    type: String,
    required: true
  }
})

))
