import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import validator from "validator";
import jwt from "jsonwebtoken";
import db from "../server.js";
import { sendVerificationMail } from "../utils/sendVerificationMail.js";
import { resetPasswordMail } from "../utils/resetPasswordMail.js"
import { CreateSession, DeleteSession } from "./session.js";

    export const register = async (req, res) => {
        const { username, email, password, repassword } = req.body;

        // Έλεγχος αν όλα τα απαραίτητα πεδία υπάρχουν
        if (!username || !email || !password || !repassword) {
            return res.status(400).json("500");
        }

        // Έλεγχος αν τα password και repassword είναι ίδια
        if (password !== repassword) {
            return res.status(400).json("503");
        }

        // Έλεγχος αν το email είναι έγκυρο
        if (!validator.isEmail(email)) {
            return res.status(400).json("504");
        }

        try {
            // Πρώτα ελέγχουμε αν υπάρχει ήδη το `username`
            db.query('SELECT * FROM users WHERE username = ?', [username], async (err, rows) => {
                if (err) {
                    console.error("Database query failed: ", err.stack);
                    return res.status(400).json("506");
                }

                if (rows.length > 0) {
                    // Αν βρούμε το username, επιστρέφουμε 505
                    return res.status(400).json("505");
                }

                // Αν δεν υπάρχει το username, προχωράμε στον έλεγχο του email
                db.query('SELECT * FROM users WHERE Email = ?', [email], async (err, rows) => {
                    if (err) {
                        console.error("Database query failed: ", err.stack);
                        return res.status(400).json("506");
                    }

                    if (rows.length > 0) {
                        // Αν βρούμε το email, επιστρέφουμε 505
                        return res.status(400).json("505");
                    }

                    // Αν όλα είναι εντάξει, προχωράμε στην εγγραφή
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    const verificationCode = Math.floor(100000 + Math.random() * 900000);
                    const hashedVerificationCode = await bcrypt.hash(verificationCode.toString(), salt);

                    // Εισαγωγή νέου χρήστη στη βάση
                    db.query('INSERT INTO users (username, email, password, VerificationCode) VALUES (?, ?, ?, ?)', 
                        [username, email, hashedPassword, hashedVerificationCode], 
                        async (err, result) => {
                            if (err) {
                                console.error("Database insert failed: ", err.stack);
                                return res.status(500).json("507");
                            }

                            const userId = result.insertId;

                            try {
                                // Αποστολή email επιβεβαίωσης
                                await sendVerificationMail({ _id: userId, email, username, verificationCode });
                            
                                const createToken = (_id) => {
                                    const jwtSecretKey = process.env.JWT;
                                    return jwt.sign({ _id }, jwtSecretKey, { expiresIn: "3d" });
                                };
                            
                                const RegistToken = createToken(userId);
                            
                                // Ρύθμιση του HTTP-only Secure Cookie
                                res.cookie('RegistToken', RegistToken, {
                                    httpOnly: true,       // Το cookie δεν είναι προσβάσιμο από JavaScript
                                    secure: false,         // Το cookie αποστέλλεται μόνο μέσω HTTPS
                                    sameSite: 'Strict',   // Προστασία από CSRF επιθέσεις
                                    maxAge: 3 * 24 * 60 * 60 * 1000 // Διάρκεια 3 ημερών σε χιλιοστά του δευτερολέπτου
                                });
                            
                                // Επιστροφή response με μήνυμα χωρίς το token
                                res.status(200).json({ message: "510" });
                            } catch (error) {
                                console.log("Failed to send verification email:", error);
                                return res.status(500).json("511");
                            }                            
                        }
                    );
                });
            });
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    };

    export const login = async (req, res) => {
        try {
            // Εκτέλεση ερωτήματος για την ανάκτηση των στοιχείων του χρήστη
            db.query('SELECT * FROM users WHERE Email = ?', [req.body.email], async (err, rows) => {
                if (err) {
                    console.error("Database query failed: ", err.stack);
                    return res.status(400).json({ error: true, message: "506" });
                }
    
                const user = rows[0];
                if (!user) {
                    return res.status(400).json({ error: true, message: "501" });
                }
    
                  // Έλεγχος αν η στήλη Verification είναι null
                  if (user.Verification === null || user.Verification == 0) {
                    // Δημιουργία του JWT token όταν το Verification είναι null
                    const createToken = (_id) => {
                        const jwtSecretKey = process.env.JWT;
                        return jwt.sign({ _id }, jwtSecretKey, { expiresIn: "3d" });
                    };

                    // Χρήση του user.id για το token
                    const LogToken = createToken(user.id);

                    res.cookie('LogToken', LogToken, {
                        httpOnly: true,       // Το cookie δεν είναι προσβάσιμο από JavaScript
                        secure: false,         // Το cookie αποστέλλεται μόνο μέσω HTTPS
                        sameSite: 'Strict',   // Προστασία από CSRF επιθέσεις
                        maxAge: 3 * 24 * 60 * 60 * 1000 // Διάρκεια 3 ημερών σε χιλιοστά του δευτερολέπτου
                    });
                
                    // Επιστροφή response με μήνυμα χωρίς το token
                    return res.status(400).json({ message: "514" });
                }
                
                // Έλεγχος αν το password είναι σωστό
                const isPasswordCorrect = await bcrypt.compare(req.body.password, user.Password);
                
                if (!isPasswordCorrect) {
                    return res.status(400).json({ error: true, message: "502" });
                }
            
                        const Username = user.Username;
                        const Email = user.Email;
                        const Verification = user.Verification;
                        
                        let sessionId;

                        try {
                            const session = await CreateSession(req, user.id);
                            sessionId = session.sessionId; 
                        } catch (err) {
                            console.error('Error creating session:', err);
                        }
                        
                        // Δημιουργία JWT token
                        const WebToken = jwt.sign(
                            { id: user.id, Username: user.Username, isAdmin: user.isAdmin },
                            process.env.JWT
                        );

                        const cookiesToClear = ['RegistToken', 'LogToken'];
                        cookiesToClear.forEach(cookie => {
                            res.clearCookie(cookie, {
                                httpOnly: true,
                                secure: false,
                                sameSite: 'Strict'
                            });
                        });

                        res
                        .cookie("SeaCalic", WebToken, {
                            httpOnly: true,
                            secure: false, // Ορίστε `true` σε περιβάλλον HTTPS
                            sameSite: 'Strict'
                        })
                        .cookie("sessionId", sessionId, {
                            httpOnly: true,
                            secure: false, // Ορίστε `true` σε περιβάλλον HTTPS
                            sameSite: 'Strict'
                        })
                        .status(200)
                        .json({ details: { Username, Email, Verification } });
            });
        } catch (err) {
            console.error("Login error: ", err);
            res.status(400).json({ error: true, message: "509" });
        }
    };
    
    export const logout = async (req, res, next) => {
        try {
            const sessionId = req.cookies.sessionId;
    
            if (sessionId) {
                try {
                    // Διαγραφή του session από τη βάση δεδομένων
                    await DeleteSession(sessionId);
                } catch (dbError) {
                    console.error("Failed to delete session from database:", dbError);
                    return res.status(500).send("Failed to logout.");
                }
            } else {
                console.warn("Logout request without session ID.");
            }
    
            // Διαγραφή cookies
            res.clearCookie("sessionId", {
                httpOnly: true,
                secure: true, // Βεβαιώσου ότι είναι true αν χρησιμοποιείς HTTPS
                sameSite: 'Strict',
            });
    
            res.clearCookie("SeaCalic", {
                httpOnly: true,
                secure: true, // Βεβαιώσου ότι είναι true αν χρησιμοποιείς HTTPS
                sameSite: 'Strict',
            });
    
            res.status(200).send("Logout successful.");
        } catch (err) {
            console.error("Error during logout:", err);
            next(err);
        }
    };
    
    export const VerifyCode = (req, res) => {
        const { code } = req.body; // Λήψη του CVerifyCode από το σώμα του αιτήματος
        const user = req.user;
        const _id = user._id; 

        // Ερώτημα για να βρούμε τον χρήστη με το id και να ελέγξουμε τον VerificationCode
        db.query('SELECT * FROM Users WHERE id = ?', [_id], async (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: true, message: '500' }); // Internal server error
            }
    
            if (rows.length === 0) {
                return res.status(404).json({ error: true, message: '501' }); // Δεν βρέθηκε ο χρήστης
            }
    
            const user = rows[0];
            const { VerificationCode } = user;

            // Έλεγχος αν το CVerifyCode είναι ίδιο με το VerificationCode
            const isMatch = await bcrypt.compare(code.toString(), VerificationCode);
            if (!isMatch) {
                return res.status(400).json({ error: true, message: '512' }); // Οι κωδικοί δεν ταιριάζουν
            }
    
            // Αν οι κωδικοί ταιριάζουν, ενημερώνουμε τον χρήστη
            db.query('UPDATE Users SET VerificationCode = 0, Verification = TRUE WHERE id = ?', [_id], async (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: true, message: '500' }); // Internal server error
                }
    
                // Δημιουργία JWT token, όπως στο login
                const WebToken = jwt.sign(
                    { id: user.id, Username: user.Username, isAdmin: user.isAdmin },
                    process.env.JWT
                );
    
                // Προετοιμασία των δεδομένων που θα επιστραφούν
                const Username = user.Username;
                const Email = user.Email;
                const Verification = true;

                const cookiesToClear = ['RegistToken', 'LogToken'];
                cookiesToClear.forEach(cookie => {
                    res.clearCookie(cookie, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'Strict'
                    });
                });

                let sessionId;

                try {
                    const session = await CreateSession(req, user.id);
                    sessionId = session.sessionId; 
                } catch (err) {
                    console.error('Error creating session:', err);
                }
                

                // Αποστολή επιτυχούς απάντησης, όπως γίνεται στο login
                return res
                    .cookie("SeaCalic", WebToken, {
                        httpOnly: true, // Κάνει το cookie μη προσβάσιμο από JavaScript
                        secure: false, // Secure μόνο σε production
                        sameSite: 'Strict', // Προστασία από CSRF
                    })
                    .cookie("sessionId", sessionId, {
                        httpOnly: true,
                        secure: false, // Ορίστε `true` σε περιβάλλον HTTPS
                        sameSite: 'Strict'
                    })
                    .status(200)
                    .json({ details: { Username, Email, Verification } });
            });
        });
    };    

    export const ResendEmail = (req, res) => {
        const user = req.user;
        const _id = user._id;
    
        // Ερώτημα για να βρούμε τον χρήστη με το id και να πάρουμε τα δεδομένα από τη βάση
        db.query('SELECT email, username, EmailResentNumber, LastEmailSentAt FROM Users WHERE id = ?', [_id], async (err, rows) => {
            if (err) {
                console.error("Error querying the database:", err); // Log error από την query
                return res.status(500).json({ error: true, message: '500' }); // Internal server error
            }
    
            if (rows.length === 0) {
                return res.status(404).json({ error: true, message: '501' }); // Δεν βρέθηκε ο χρήστης
            }
    
            const userData = rows[0]; // Παίρνουμε τα δεδομένα του χρήστη από τη βάση
    
            const email = userData.email; // Απόκτηση του email από το αντικείμενο
            const username = userData.username; // Απόκτηση του username από το αντικείμενο
            let emailResentNumber = userData.EmailResentNumber; // Αποκτούμε τον αριθμό αποστολών email επιβεβαίωσης
            const LastEmailSentAt = userData.LastEmailSentAt;
            let lastEmailDate = null;
            const CurrentDate = new Date();
            let diffInMilliseconds;
    
            // Έλεγχος αν το LastEmailSentAt είναι έγκυρη τιμή και συμβολοσειρά
            if (LastEmailSentAt && typeof LastEmailSentAt === 'string') {
                lastEmailDate = new Date(LastEmailSentAt.replace(' ', 'T')); // Μόνο αν είναι συμβολοσειρά
                diffInMilliseconds = CurrentDate - lastEmailDate;
            } else if (LastEmailSentAt instanceof Date) {
                // Αν το LastEmailSentAt είναι ήδη τύπου Date, δεν χρειάζεται μετατροπή
                lastEmailDate = LastEmailSentAt;
                diffInMilliseconds = CurrentDate - lastEmailDate;
            } else {
                // Αν το LastEmailSentAt είναι null ή undefined, θέτουμε τη διαφορά σε 3600000 ms (1 ώρα)
                diffInMilliseconds = 3600000; // 3600 * 1000 = 1 ώρα σε milliseconds
            }
    
            const diffInHours = diffInMilliseconds / (1000 * 60 * 60); // Διαφορά σε ώρες
    
            // Έλεγχος αν το EmailResentNumber δεν είναι 3
            if (emailResentNumber < 3) {
                const salt = await bcrypt.genSalt(10);
                const verificationCode = Math.floor(100000 + Math.random() * 900000); // Δημιουργία νέου verification code                
                const hashedVerificationCode = await bcrypt.hash(verificationCode.toString(), salt);
    
                try {
                    // Αποστολή email επιβεβαίωσης με τα σωστά δεδομένα
                    await sendVerificationMail({ _id: _id, email, username, verificationCode });
    
                    // Αφού σταλεί επιτυχώς το email, ενημερώνουμε τις στήλες EmailResentNumber και LastEmailSentAt
                    const currentDate = new Date(); // Η τρέχουσα ημερομηνία και ώρα
                    emailResentNumber += 1; // Αυξάνουμε το EmailResentNumber κατά 1
    
                    await db.query('UPDATE Users SET EmailResentNumber = ?, LastEmailSentAt = ?, VerificationCode = ? WHERE id = ?', 
                        [emailResentNumber, currentDate, hashedVerificationCode, _id]);
    
                    res.status(200).json({ 
                        message: "517"
                    });
                } catch (error) {
                    console.error("Failed to send verification email:", error); // Log error αποστολής email
                    return res.status(500).json("511");
                }
            } else if (diffInHours >= 1) {
                const salt = await bcrypt.genSalt(10);
                const verificationCode = Math.floor(100000 + Math.random() * 900000); // Δημιουργία νέου verification code                
                const hashedVerificationCode = await bcrypt.hash(verificationCode.toString(), salt);
    
                try {
                    // Αποστολή email επιβεβαίωσης με τα σωστά δεδομένα
                    await sendVerificationMail({ _id: _id, email, username, verificationCode });
    
                    // Αφού σταλεί επιτυχώς το email, ενημερώνουμε τις στήλες EmailResentNumber και LastEmailSentAt
                    const currentDate = new Date(); // Η τρέχουσα ημερομηνία και ώρα
    
                    await db.query('UPDATE Users SET EmailResentNumber = 0, LastEmailSentAt = ?, VerificationCode = ? WHERE id = ?', 
                        [currentDate, hashedVerificationCode, _id]);
    
                    res.status(200).json({ 
                        message: "517"
                    });
                } catch (error) {
                    console.error("Failed to send verification email:", error); // Log error αποστολής email
                    return res.status(500).json("511");
                }
    
            } else {
                // Αν το EmailResentNumber είναι 3, δεν κάνουμε τίποτα άλλο και επιστρέφουμε ένα μήνυμα.
                return res.status(400).json({ error: true, message: '516' });
            }
        });
    };   
    
    export const ResetPassword = async (req, res) => {
        const email = req.body.email;
        const AdTrOrFa = false;

        if (!email) {
            return res.status(400).json({ error: true, message: '518' });
        }
    
        // Ερώτημα στη βάση δεδομένων για να βρούμε αν υπάρχει χρήστης με αυτό το email
        db.query('SELECT * FROM users WHERE Email = ?', [email], async (err, rows) => {
            if (err) {
                console.error("Error querying the database:", err);
                return res.status(500).json({ error: true, message: '511' });
            }
    
            if (rows.length === 0) {
                // Αν δεν βρέθηκε κανένας χρήστης με αυτό το email
                return res.status(404).json({ error: true, message: '501' });
            }
    
            const userData = rows[0]; // Παίρνουμε τον πρώτο χρήστη
            const userId = userData.id;
            const resetEmailNumber = userData.ResetEmailNumber; // Λαμβάνουμε το ResetEmailNumber από τα δεδομένα
            const lastResetTokenDate = userData.ResetTokenDate; // Λαμβάνουμε το ResetTokenDate
    
            const createToken = (_id) => {
                const jwtSecretKey = process.env.JWT;
                return jwt.sign({ _id }, jwtSecretKey, { expiresIn: "3d" });
            };
    
            const ResetToken = createToken(userId);
            const username = userData.Username;
            const currentDateTime = new Date();
    
            // Ελέγχουμε αν το ResetEmailNumber είναι μικρότερο από 3
            if (resetEmailNumber < 3) {
                const NewResetEmailNumber = resetEmailNumber + 1;
                try {
                    // Αποστολή email επιβεβαίωσης
                    await resetPasswordMail({ _id: userId, email, username, ResetToken, AdTrOrFa });
    
                    // Αύξηση του ResetEmailNumber και ενημέρωση της ResetTokenDate
                    db.query(
                        'UPDATE users SET ResetEmailNumber = ?, ResetTokenDate = ? WHERE id = ?',
                        [NewResetEmailNumber, currentDateTime, userId],
                        (err, result) => {
                            if (err) {
                                console.error("Error updating ResetTokenDate in the database:", err);
                                return res.status(500).json({ error: true, message: '511' });
                            }
                            return res.status(200).json({ error: false, message: '519' });
                        }
                    );
                } catch (error) {
                    console.error("Failed to send verification email:", error);
                    return res.status(500).json({ error: true, message: '511' });
                }
            } else {
                // Εάν το ResetEmailNumber >= 3, ελέγχουμε αν έχει περάσει μία ώρα από το ResetTokenDate
                const oneHourAgo = new Date(currentDateTime.getTime() - 60 * 60 * 1000);
    
                if (new Date(lastResetTokenDate) < oneHourAgo) {
                    // Έχει περάσει μία ώρα, μπορούμε να στείλουμε το email και να μηδενίσουμε το ResetEmailNumber
                    try {
                        await resetPasswordMail({ _id: userId, email, username, ResetToken, AdTrOrFa });
    
                        // Μηδενίζουμε το ResetEmailNumber και ενημερώνουμε το ResetTokenDate
                        db.query(
                            'UPDATE users SET ResetEmailNumber = 1, ResetTokenDate = ? WHERE id = ?',
                            [currentDateTime,  userId],
                            (err, result) => {
                                if (err) {
                                    console.error("Error updating ResetTokenDate in the database:", err);
                                    return res.status(500).json({ error: true, message: '511' });
                                }
                                return res.status(200).json({ error: false, message: '519' });
                            }
                        );
                    } catch (error) {
                        console.error("Failed to send verification email:", error);
                        return res.status(500).json({ error: true, message: '511' });
                    }
                } else {
                    // Δεν έχει περάσει μία ώρα, επιστρέφουμε μήνυμα
                    return res.status(400).json({
                        error: true,
                        message: '516'
                    });
                }
            }
        });
    };
    
    export const ResetPassCheck = async (req, res) => {
        try {
            const { password } = req.body;
            const user = req.user;
    
            // 🔍 Έλεγχος αν το `req.user` υπάρχει και περιέχει το `id`
            if (!user) {
                console.error("Error: req.user is undefined!");
                return res.status(401).json({ error: true, message: "Unauthorized" });
            }
    
            const id = user._id || user.id; // Εξασφαλίζουμε ότι διαβάζουμε το σωστό ID
            if (!id) {
                console.error("Error: User ID is missing in req.user:", user);
                return res.status(400).json({ error: true, message: "User ID is required" });
            }
    
            console.log("User ID extracted:", id);
    
            // Δημιουργία hashed password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
    
            // 🔹 Ενημέρωση του password στη βάση δεδομένων
            await new Promise((resolve, reject) => {
                db.query("UPDATE Users SET Password = ? WHERE id = ?", [hashedPassword, id], (err) => {
                    if (err) {
                        console.error("Error updating password:", err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
    
            // 🔹 Ενημέρωση του ResetTokenDate
            const oldDate = new Date("2000-02-02 00:00:00");
            await new Promise((resolve, reject) => {
                db.query("UPDATE Users SET ResetTokenDate = ? WHERE id = ?", [oldDate, id], (err) => {
                    if (err) {
                        console.error("Error updating ResetTokenDate:", err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
    
            // 🔹 Ανάκτηση των πληροφοριών του χρήστη από τη βάση δεδομένων
            const userData = await new Promise((resolve, reject) => {
                db.query("SELECT Username, Email, isAdmin, Verification FROM Users WHERE id = ?", [id], (err, results) => {
                    if (err) {
                        console.error("Error fetching user data:", err);
                        return reject(err);
                    }
                    if (results.length === 0) {
                        console.error("User not found in database");
                        return reject(new Error("User not found"));
                    }
                    resolve(results[0]);
                });
            });
    
            // 🔹 Ανάθεση τιμών από τη βάση δεδομένων
            const Username = userData.Username;
            const Email = userData.Email;
            const Admin = userData.isAdmin;
            const Verification = userData.Verification;
    
            console.log("Fetched User Data:", { Username, Email, Admin, Verification });
    
            // 🔹 Δημιουργία JWT token
            const WebToken = jwt.sign(
                { id: id, Username: Username, isAdmin: Admin },
                process.env.JWT 
            );
    
            // 🔹 Καθαρισμός cookies
            const cookiesToClear = ["RegistToken", "LogToken"];
            cookiesToClear.forEach((cookie) => {
                res.clearCookie(cookie, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "Strict",
                });
            });
    
            // 🔹 Δημιουργία session
            let sessionId;
            try {
                const session = await CreateSession(req, id);
                sessionId = session.sessionId;
            } catch (err) {
                console.error("Error creating session:", err);
                return res.status(500).json({ error: true, message: "Failed to create session" });
            }
    
            // 🔹 Αποστολή των cookies και απόκρισης στον client
            return res
                .cookie("SeaCalic", WebToken, { httpOnly: true })
                .cookie("sessionId", sessionId, {
                    httpOnly: true,
                    secure: false, // Ορίστε `true` αν χρησιμοποιείτε HTTPS
                    sameSite: "Strict",
                })
                .status(200)
                .json({ details: { Username, Email, Verification } });
    
        } catch (error) {
            console.error("Unexpected error in ResetPassCheck:", error);
            return res.status(500).json({ error: true, message: "Internal Server Error" });
        }
    };