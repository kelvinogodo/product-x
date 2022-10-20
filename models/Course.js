import mongoose from 'mongoose'
import Category from './Category'

const schema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: [Category],
    required: true
  }
})

export default mongoose.model(schema)
