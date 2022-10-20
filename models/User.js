import mongoose from 'mongoose'

const schema = mongoose.Schema({
  email: {
    type: String,
    required: true
  }
})

export default mongoose.model(schema)
