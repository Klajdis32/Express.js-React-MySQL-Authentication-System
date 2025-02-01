const errors = [
    { 
        code: "500", 
        message: "Please fill out all required fields!", 
        severity: "medium" 
    },
    { 
        code: "501", 
        message: "User not found!", 
        severity: "medium" 
    },
    { 
        code: "502", 
        message: "Wrong password or email!", 
        severity: "medium" 
    },
    { 
        code: "503", 
        message: "Passwords do not match!", 
        severity: "medium" 
    },
    { 
        code: "504", 
        message: "Email must be a valid email!", 
        severity: "medium" 
    },
    { 
        code: "505", 
        message: "User already exists...", 
        severity: "medium" 
    },
    { 
        code: "506", 
        message: "Database query error. Please try again later...", 
        severity: "high" 
    },
    { 
        code: "507", 
        message: "Your account created successfully!", 
        severity: "success" 
    },
    { 
        code: "509", 
        message: "Something went wrong, please try again later!", 
        severity: "high" 
    },
    { 
        code: "510", 
        message: "Your account is almost ready, please wait...", 
        severity: "success" 
    },
    { 
        code: "511", 
        message: "Failed to send verification email..", 
        severity: "high" 
    },
    { 
        code: "512", 
        message: "Invalid verification code", 
        severity: "high" 
    },
    {
        code: "513",
        message: "There is an issue with authorization (token has expired). To resolve this problem, please log in to your account and follow the instructions provided there.",
        severity: "high"
    },    
    { 
        code: "514", 
        message: "User verification is missing. To continue, please verify your account here:", 
        severity: "medium" 
    },
    { 
        code: "515", 
        message: "Verification succes", 
        severity: "success" 
    },
    { 
        code: "516", 
        message: "You have reached the sending limit, please try again in an hour or later!", 
        severity: "high" 
    },
    { 
        code: "517", 
        message: "Τhe email has been resended successfully!", 
        severity: "success" 
    },
    { 
        code: "518", 
        message: "Email not found!", 
        severity: "medium" 
    },
    { 
        code: "519", 
        message: "An email with instructions to reset your password has been sent to your inbox. Please check your email to proceed with the password reset.", 
        severity: "success" 
    },
    { 
        code: "520", 
        message: "The reset token has expired. Please use the 'Forgot your password?' option on the login page to request a new one!", 
        severity: "high" 
    },
    { 
        code: "521", 
        message: "Your password has been successfully changed, please wait...", 
        severity: "success" 
    },
];

export default errors;