import express from "express";
import { loginAdminPage, logout, ResetPassword, ResetPassCheck } from "../controllers/adminAuth.js";

const router = express.Router();

router.post("/login", loginAdminPage);
router.post("/logout", logout);
router.post("/resetPassword", ResetPassword);
router.post("/resetPassCheck",ResetPassCheck);

export default router;