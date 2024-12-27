import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path: "./.env"
});

connectDB()
 .then(()=>{
        app.on("error",(error)=>{
            console.log("Error in connecting to the server");
            throw error;    
        })
        app.listen(process.env.PORT || 8800,()=>{
           console.log(`Server is running at port ${process.env.PORT}`);
       })
   
 })
 .catch((error)=>{
     console.error("MongoDB Connection failed !!! Error : ",error);
 });