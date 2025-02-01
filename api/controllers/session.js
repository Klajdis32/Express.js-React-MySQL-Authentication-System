import db from "../server.js";
import crypto from "crypto";

export const CreateSession = async (req, userId) => {
    try {
        if (!userId) {
            throw new Error("User ID is required");
        }

        // Δημιουργία μοναδικού session ID
        const sessionId = crypto.randomUUID();

        // Απόκτηση IP διεύθυνσης (εάν υπάρχει)
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const expires = 3600; 
        // Τα δεδομένα του session (προσαρμόστε όπως χρειάζεται)
        const sessionData = JSON.stringify({ userAgent: req.headers['user-agent'] });

        // Εισαγωγή session στον πίνακα
        db.query(
            `INSERT INTO session_users (userId, session_id, ip_address, expires, data) VALUES (?, ?, ?, ?, ?)`,
            [userId, sessionId, ipAddress, expires, sessionData]
        );

        // Επιστροφή του session ID
        return { sessionId, expires };
    } catch (error) {
        console.error('Error creating session:', error);
        throw error;
    }
};

export const DeleteSession = async (sessionId) => {
    try {
        if (!sessionId) {
            throw new Error("Session ID is required");
        }

        // Διαγραφή του session από τη βάση δεδομένων
        const result = await db.query(
            "DELETE FROM session_users WHERE session_id = ?",
            [sessionId]
        );

        // Έλεγχος αν διαγράφηκε κάποιο session
        if (result.affectedRows === 0) {
            throw new Error(`Session ${sessionId} does not exist or was already deleted.`);
        }
        
        return {
            success: true,
            message: `Session ${sessionId} deleted successfully.`,
        };
    } catch (error) {
        console.error("Error deleting session:", error.message);
        throw error;
    }
};
