import mongoose from "mongoose"
import * as dotenv from 'dotenv'

dotenv.config()

mongoose.connect(process.env.MONGO_URI)
const db = mongoose.connection

db.on('error', (e) => {
  console.log('database connection error', e)
})
