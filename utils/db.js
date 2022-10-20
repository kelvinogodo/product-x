import mongoose from "mongoose"
import * as dotenv from 'dotenv'

dotenv.config()

mongoose.connect(process.env.MONGO_URI, { newUrlParser: true, useUnifiedTopology: true })
