import express from "express";
import { login, logout, register, VerifyCode, ResendEmail, ResetPassword, ResetPassCheck } from "../controllers/auth.js";
import { authenticateRegistToken, authenticateResetToken, authenticateResendEmailToken } from '../controllers/authenticateToken.js';

const router = express.Router();

router.post("/register", register);
router.post("/logout", logout);
router.post("/login", login);
router.post("/entryControl", login);
router.post("/resetPassword", ResetPassword);
router.post("/verifyUser", authenticateRegistToken, VerifyCode);
router.post("/resendEmail", authenticateResendEmailToken, ResendEmail); 
router.post("/resetPassCheck",authenticateResetToken, ResetPassCheck); 
// router.post("/verifyUser", authenticateToken, VerifyCode);

export default router;