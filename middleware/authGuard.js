const playerModel = require('../models/playerModels');
const managerModel = require('../models/managerModels');
const adminModel = require('../models/adminModels'); // Si vous avez un modèle d'admin

const authGuard = async (req, res, next) => {
    try {
        if (req.session.user) {
            // Chercher l'utilisateur parmi les différents modèles
            const user = await playerModel.findOne({ _id: req.session.user._id }) ||
                         await managerModel.findOne({ _id: req.session.user._id }) ||
                         await adminModel.findOne({ _id: req.session.user._id }); 
            
            if (user) {
                // Stocker le rôle de l'utilisateur pour l'utiliser plus tard dans les routes
                req.userRole = user.role || 'player'; // Le rôle par défaut est 'player' si non défini
                next(); // Poursuivre la requête
            } else {
                res.redirect('/login'); // Rediriger si l'utilisateur n'est pas trouvé
            }
        } else {
            res.redirect('/login'); // Rediriger si la session n'existe pas
        }
    } catch (error) {
        res.send(error.message); // Afficher l'erreur si quelque chose ne va pas
    }
};

module.exports = authGuard;
