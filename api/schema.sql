-- Δημιουργία πίνακα users σε mysql:

CREATE TABLE users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(255) COLLATE utf8mb4_general_ci NOT NULL,
    Email VARCHAR(255) COLLATE utf8mb4_general_ci NOT NULL,
    Password VARCHAR(255) COLLATE utf8mb4_general_ci NOT NULL,
    isAdmin TINYINT(1) NOT NULL DEFAULT 0,
    Verification TINYINT(1) NOT NULL DEFAULT 0,
    VerificationCode VARCHAR(600) COLLATE utf8mb4_general_ci DEFAULT NULL,
    EmailResentNumber INT(255) DEFAULT NULL,
    LastEmailSentAt DATETIME DEFAULT NULL,
    ResetEmailNumber INT(255) DEFAULT NULL,
    ResetTokenDate DATETIME DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Δημιουργία πίνακα session σε mysql:

CREATE TABLE `session_users` (
    `userId` VARCHAR(255) DEFAULT NULL,
    `session_id` VARCHAR(255) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
    `ip_address` VARCHAR(255) DEFAULT NULL,
    `expires` INT(11) UNSIGNED NOT NULL,
    `data` MEDIUMTEXT COLLATE utf8mb4_bin,
    `createdOn` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `LastUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
