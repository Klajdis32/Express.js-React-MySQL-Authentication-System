import express from "express";
import dotenv from "dotenv";
import mysql from "mysql";
import authRoute from "./routes/clientAuth.js";
import adminAuthRoute from "./routes/adminAuth.js";
import adminPageRoute from "./routes/adminPage.js";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import helmet from "helmet";

dotenv.config();
const app = express()

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: ", err.stack);
        return;
    }
    console.log("Connected to database!");
});

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001" ];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Επιτρέπει τα cookies
    allowedHeaders: ["Content-Type", "Authorization"], // Επέκτεινε αν χρειάζεται
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// app.use(helmet());  Προστασία HTTP headers
app.use(cookieParser());
app.use(express.json())

app.use((err, req, res, next) => {
    console.error('Error middleware triggered:', err);
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Something went wrong!";
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: err.stack,
    });
});

app.use("/api/auth" , authRoute);
app.use("/api/adminAuth" , adminAuthRoute);
app.use("/api/fromAdminPage" , adminPageRoute);

const PORT = process.env.API_PORT; 

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default db; 