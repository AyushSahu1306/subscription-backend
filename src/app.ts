import './types/express.js';
import express from "express";
import authRoutes from "./modules/auth/auth.routes.js"
import { requireAuth } from "./modules/auth/auth.middleware.js";
export const app = express();

app.use(express.json());

app.get('/health',(req,res)=>{
    res.status(200).json({status:"ok"});
});

app.use("/auth",authRoutes);

app.get("/protected",requireAuth,(req,res)=>{
    return res.status(200).json({
        message: 'You are authenticated',
        userId:req.user?.id
    });
})
