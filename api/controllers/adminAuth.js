import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../server.js";
import { resetPasswordMail } from "../utils/resetPasswordMail.js"

export const loginAdminPage = async (req, res) => {
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

            // Έλεγχος αν το password είναι σωστό
            const isPasswordCorrect = await bcrypt.compare(req.body.password, user.Password);

            // Έλεγχος αν ο χρήστης είναι Admin
            if (user.isAdmin !== 1) {
                return res.status(403).json({ error: true, message: "522" });
            }    

            if (!isPasswordCorrect) {
                return res.status(400).json({ error: true, message: "502" });
            }

            // Έλεγχος αν η στήλη Verification είναι null
            if (user.Verification === null) {
                // Δημιουργία του JWT token όταν το Verification είναι null
                const createToken = (_id) => {
                    const jwtSecretKey = process.env.JWT;
                    return jwt.sign({ _id }, jwtSecretKey, { expiresIn: "3d" });
                };

                // Χρήση του user.id για το token
                const LogToken = createToken(user.id);

                res.cookie('LogToken', LogToken, {
                    httpOnly: true,        // Το cookie δεν είναι προσβάσιμο από JavaScript
                    secure: false,         // Το cookie αποστέλλεται μόνο μέσω HTTPS
                    sameSite: 'Strict',    // Προστασία από CSRF επιθέσεις
                    maxAge: 3 * 24 * 60 * 60 * 1000 // Διάρκεια 3 ημερών σε χιλιοστά του δευτερολέπτου
                });

                // Επιστροφή response με μήνυμα χωρίς το token
                return res.status(400).json({ message: "514" });
            }

            const Username = user.Username;
            const Email = user.Email;
            const Verification = user.Verification;

            // Δημιουργία JWT token
            const WebToken = jwt.sign(
                { id: user.id, Username: user.Username, isAdmin: user.isAdmin },
                process.env.JWT
            );
            
            res
                .cookie("SeaCalicAd", WebToken, {
                    httpOnly: true,
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
        res.clearCookie("SeaCalicAd");
        res.status(200).send("Logout successful.");
    } catch (err) {
        next(err);
    }
};

export const ResetPassword = async (req, res) => {
    const email = req.body.email;
    const AdTrOrFa = true;

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

        // Έλεγχος αν ο χρήστης είναι Admin
        if (userData.isAdmin !== 1) {
            return res.status(403).json({ error: true, message: "522" });
        }    

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
  // Εξαγωγή του token από το Authorization header
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: "513" }); // Unauthorized (το token λείπει ή είναι σε λάθος μορφή)
  }

  // Λαμβάνουμε το token από το header
  const token = authHeader.split(' ')[1];

  try {
    // Επαλήθευση του JWT token
    const user = jwt.verify(token, process.env.JWT);

    // Αποθήκευση των πληροφοριών του χρήστη στο request object
    req.user = user;

    // Εξαγωγή των πληροφοριών του χρήστη
    const { password } = req.body;
    const _id = user._id;

    // Έλεγχος ResetTokenDate
    db.query('SELECT ResetTokenDate FROM Users WHERE id = ?', [_id], async (err, results) => {
      if (err) {
        console.error('Error fetching ResetTokenDate:', err);
        return res.status(500).json({ error: true, message: '500' }); // Internal Server Error
      }

      if (results.length === 0) {
        return res.status(404).json({ error: true, message: '501' }); // User not found
      }

      const resetTokenDate = new Date(results[0].ResetTokenDate);
      const currentDate = new Date();

      // Υπολογισμός διαφοράς σε ημέρες
      const timeDifference = Math.abs(currentDate - resetTokenDate);
      const dayDifference = timeDifference / (1000 * 60 * 60 * 24);

      if (dayDifference > 2) {
        return res.status(403).json({ error: true, message: '520' }); // Token expired
      }

      // Αν το token είναι έγκυρο, προχωράμε με την αλλαγή του password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Ενημέρωση του password στη βάση δεδομένων
      db.query('UPDATE Users SET Password = ? WHERE id = ?', [hashedPassword, _id], (err) => {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json({ error: true, message: '500' });
        }

        // Ενημέρωση του ResetTokenDate
        const oldDate = new Date('2000-02-02 00:00:00');
        db.query('UPDATE Users SET ResetTokenDate = ? WHERE id = ?', [oldDate, _id], (err) => {
          if (err) {
            console.error('Error updating ResetTokenDate:', err);
            return res.status(500).json({ error: true, message: '500' });
          }

          // Επιστροφή επιτυχίας
          res.status(200).json({ success: true, message: '521' });
        });
      });
    });
  } catch (err) {
    console.error('Error verifying token:', err);
    return res.status(403).json({ error: true, message: "509" }); // Forbidden (το token είναι άκυρο ή ληγμένο)
  }
};

