import db from "../../server.js";

export const getActiveUsers = (req, res) => {
    const sessionQuery = "SELECT userId FROM session_users";

    db.query(sessionQuery, (err, sessionResults) => {
        if (err) {
            console.error("Σφάλμα στη λήψη των συνδεδεμένων χρηστών:", err);
            return res.status(500).json({ error: "Σφάλμα στη βάση δεδομένων" });
        }

        // Αν δεν υπάρχουν ενεργοί χρήστες, επιστρέφουμε κενό πίνακα
        if (sessionResults.length === 0) {
            return res.json([]);
        }

        // Παίρνουμε όλα τα userId σε έναν πίνακα
        const userIds = sessionResults.map((row) => row.userId);

        // Επιλέγουμε μόνο τα πεδία που θέλουμε από τον πίνακα users
        const usersQuery = `SELECT id, Username, Email, isAdmin, Verification FROM users WHERE id IN (?)`;

        db.query(usersQuery, [userIds], (err, usersResults) => {
            if (err) {
                console.error("Σφάλμα στη λήψη των χρηστών:", err);
                return res.status(500).json({ error: "Σφάλμα στη βάση δεδομένων" });
            }

            res.json(usersResults);
        });
    });
};