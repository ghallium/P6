// Import package Express
const express = require('express');
// Import package Mongoose
const mongoose = require('mongoose');
const helmet = require('helmet');
require('dotenv').config({ path: 'config/.env' });

// Constantes Routes principales
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

const path = require('path');
const app = express();

// Connexion admin 
mongoose.connect(process.env.MONGO,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

// Autorisations requêtes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // API autorise tous types d'utilsateurs
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // Headers autorisés
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Méthodes autorisées
    next();
  });

app.use(helmet({
    crossOriginResourcePolicy: { policy: "same-site" }
  }));

// Gestion routes principales
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));

  
module.exports = app;