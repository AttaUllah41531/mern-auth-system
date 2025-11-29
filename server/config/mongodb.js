import mongoose from 'mongoose';

const connectDb = async ()=> {
    try {
       
          await mongoose.connect(`${process.env.DB_ATLAS}/mern_auth`);   
          mongoose.connection.on("connected", () =>
            console.log("database connected")
          );     
    } catch (error) {
        console.log(error.message);
    }
    
}


export default connectDb;