import express from "express";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Welcome to the Post Routes API");
});

router.post("/create", (req, res) => {

});

router.put("/update", (req, res) => {

});

router.delete("/delete", (req, res) => {

});

router.get("/get", (req, res) => {

});

router.get("/get-all", (req, res) => {

});

router.get("/get-user-posts", (req, res) => {

});

router.get("/get/:id",(req,res)=>{

});

router.put("update/:id",(req,res)=>{

});


export default router;