// import password-validator
const passwordValidator = require('password-validator');

// création schéma password
const passwordSchema = new passwordValidator();

// schéma que doit respecter password 
passwordSchema
.is().min(5)                                    // Minimum length 5
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values





// Vérification qualité password 
module.exports = (req, res, next) => {
    if(passwordSchema.validate(req.body.password)){
        next();
    }else{
        return res.status(400).json({error : ` Le mot de passe n'est pas assez fort ${passwordSchema.validate('req.body.password', {list: true})} `})
    }
}

