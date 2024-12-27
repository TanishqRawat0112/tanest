import express from "express";

const router = express.Router();

router.get("/test",(req,res)=>{
    res.send("Welcome to the User Routes API");
});


router.put("/update-details",(req,res)=>{
    res.send("Update Details");
});

router.put("/update-password",(req,res)=>{
    res.send("Update Password");
});

router.put("update-avatar",(req,res)=>{
    res.send("Update Avatar");
});

router.delete("/delete",(req,res)=>{
    res.send("Delete");
});

export default router;