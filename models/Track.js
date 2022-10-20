import mongoose from 'mongoose'

const schema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
})

export default mongoose.model(schema)
