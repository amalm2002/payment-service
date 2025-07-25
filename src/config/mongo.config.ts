import 'dotenv/config'
import mongoose from 'mongoose'

const connectDB = async (): Promise<void> => {
    try {
        const MONGO_URLURL = process.env.NODE_ENV === 'dev' ? process.env.MONGO_URL_DEV : process.env.MONGO_URL_PRO
        if (!MONGO_URLURL) {
            throw new Error('MONGO_URL is not defined in environment variables.')
        }
        await mongoose.connect(MONGO_URLURL)
        console.log("database Connected.....");
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
    }
}

export default connectDB