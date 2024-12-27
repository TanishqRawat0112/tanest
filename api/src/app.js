import dotenv from "dotenv";
import express, {urlencoded} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


dotenv.config({
    path: "./env"
});

const app = express();
app.use(cors({
    origin:'http://localhost:8800',
    credentials:true,
}));
app.use(express.json({
    limit:"20kb"
}));
app.use(urlencoded({
    extended:true,
    limit:"20kb"
}));
app.use(express.static("public"));
app.use(cookieParser());

//import routes
import postRouter from "./routes/post.routes.js";
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";


app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users",userRouter);
app.use("/api/v1/auth",authRouter);

export default app;