import mongoose from 'mongoose'

export default (mongoose.models.Track ?? mongoose.model('Track', mongoose.Schema({
  slug: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
})))
