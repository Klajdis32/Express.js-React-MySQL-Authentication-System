import express from "express";
import { getActiveUsers } from "../controllers/adminPage/clients.js";

const router = express.Router();

router.get("/getActiveUsers", getActiveUsers);

export default router;