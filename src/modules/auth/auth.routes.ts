import { Router } from "express";
import { signup } from "./signup.controller.js";
import { login } from "./login.controller.js";
import { refresh } from "./refresh.controller.js";
import { logout } from "./logout.controller.js";
import { requireAuth } from "./auth.middleware.js";
import { logoutAll } from "./logoutAll.controller.js";

const router = Router();

router.post('/signup',signup);
router.post('/login',login);
router.post('/refresh',refresh);
router.post('/logout',logout);
router.post('/logout-all',requireAuth,logoutAll);


export default router;