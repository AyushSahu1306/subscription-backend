import { Router } from "express";
import { signup } from "./signup.controller.js";
import { login } from "./login.controller.js";

const router = Router();

router.post('/signup',signup);
router.post('/login',login);

export default router;