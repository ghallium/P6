// Importation package JsonWebToken
const jwt = require('jsonwebtoken');
 // Utilisation token unique avec clé d'identification
module.exports = (req, res, next) => {
   // Décodage du Token
    try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};