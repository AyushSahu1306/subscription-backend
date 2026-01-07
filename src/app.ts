import './types/express.js';
import express from "express";
import authRoutes from "./modules/auth/auth.routes.js"
import { requireAuth } from "./modules/auth/auth.middleware.js";
import subscriptionRoutes from "./modules/subscriptions/subscription.routes.js"
import { requireActiveSubscription } from './modules/subscriptions/subscription.middleware.js';
import paymentRoutes from './modules/payments/payment.routes.js'

export const app = express();

app.use('/webhooks/payment',express.raw({type:'application/json'}));

app.use(express.json());

app.get('/health',(req,res)=>{
    res.status(200).json({status:"ok"});
});

app.use("/auth",authRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/webhooks/payment',paymentRoutes);

app.get("/protected",requireAuth,(req,res)=>{
    return res.status(200).json({
        message: 'You are authenticated',
        userId:req.user?.id
    });
})


app.get("/premium",requireAuth,requireActiveSubscription,(req,res)=>{
    res.status(200).json({ message: 'Premium access granted' });
})