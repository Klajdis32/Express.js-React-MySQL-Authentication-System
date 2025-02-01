import jwt from 'jsonwebtoken';

export const authenticateRegistToken = (req, res, next) => {
  // Προσπάθησε να βρεις το token από τα cookies
  let token = req.cookies['RegistToken'] || req.cookies['LogToken'];// Μπορείς να προσθέσεις περισσότερα cookies εδώ

  // Αν δεν βρέθηκε κανένα token, επιστρέφει Unauthorized
  if (!token) return res.status(401).json({ error: true, message: "513" }); // Unauthorized

  // Επαλήθευση του JWT token
  jwt.verify(token, process.env.JWT, (err, user) => {
      if (err) return res.status(403).json({ error: true, message: "509" }); // Forbidden (το token είναι άκυρο ή ληγμένο)
      
      // Αποθήκευση των πληροφοριών του χρήστη στο request object
      req.user = user;

      // Συνέχισε στο επόμενο middleware
      next();
  });
};

export const authenticateResetToken = (req, res, next) => {
  // Εξαγωγή του token από το Authorization header
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: "513" }); // Unauthorized (το token λείπει ή είναι σε λάθος μορφή)
  }

  // Λαμβάνουμε το token από το header
  const token = authHeader.split(' ')[1];

  // Επαλήθευση του JWT token
  jwt.verify(token, process.env.JWT, (err, user) => {
    if (err) return res.status(403).json({ error: true, message: "509" }); // Forbidden (το token είναι άκυρο ή ληγμένο)

    // Αποθήκευση των πληροφοριών του χρήστη στο request object
    req.user = user;
    
    console.log(user);

    // Συνέχισε στο επόμενο middleware
    next();
  });
};

export const authenticateResendEmailToken = (req, res, next) => {
  // Προσπάθησε να βρεις το token από τα cookies
  let token = req.cookies['RegistToken'] || req.cookies['LogToken'];;

  // Αν δεν βρέθηκε κανένα token, επιστρέφει Unauthorized
  if (!token) return res.status(401).json({ error: true, message: "513" }); // Unauthorized

  // Επαλήθευση του JWT token
  jwt.verify(token, process.env.JWT, (err, user) => {
      if (err) return res.status(403).json({ error: true, message: "509" }); // Forbidden (το token είναι άκυρο ή ληγμένο)
      
      // Αποθήκευση των πληροφοριών του χρήστη στο request object
      req.user = user;

      // Συνέχισε στο επόμενο middleware
      next();
  });
};

