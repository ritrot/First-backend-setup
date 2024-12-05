import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbconnect =async ()=>{    
    try{
       const connectioninstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       console.log(`Database is connected.`);
       
    }catch (error) {
        console.log(`ERROR => Database connection error is in db/index.js = ${error.message}`);
    }
}

export default dbconnect;