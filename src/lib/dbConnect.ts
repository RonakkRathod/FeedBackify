import { log } from 'console'
import mongoose from 'mongoose'


type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
    if (connection.isConnected) { // check if Database already connected or not
        console.log("Already connected to database");
    }

    try {
       const db = await mongoose.connect(process.env.MONGODB_URI || '')

       connection.isConnected = db.connections[0].readyState

       console.log("DB Connected Successfullly");
       console.log("DB Connections",db.connections);
       console.log("DB ",db);
       
    } catch (error) {
        console.log("Database connection failed",error);
        
        process.exit();
    }
}


export default dbConnect; 