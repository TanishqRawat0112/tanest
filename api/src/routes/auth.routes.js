import { Router } from "express";
import {
    register,
    login,
    logout
} from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";


const router = Router();


router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
    ]),
    register
);

// router.post("/register",(req,res)=>{
//     res.send("Register");
// });

router.route("/login").post(upload.none(),login);

// router.post("/login",(req,res)=>{
//     res.send("Login");
// });

router.route("/logout").post(verifyJWT,upload.none(),logout);

// router.post("/logout",(req,res)=>{
//     res.send("Logout");
// });

export default router;