import express from "express";
import authRoutes from "./modules/auth/auth.routes.js"
export const app = express();

app.use(express.json());

app.get('/health',(req,res)=>{
    res.status(200).json({status:"ok"});
});

app.use("/auth",authRoutes);

