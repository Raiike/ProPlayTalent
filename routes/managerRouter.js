const express = require('express');
const managerRouter = express.Router();
const authGuard = require('../middleware/authGuard');
const upload = require('../middleware/upload'); 
const managerModel = require('../models/managerModels'); // Assurez-vous que le chemin est correct

// Route pour afficher le formulaire d'inscription
managerRouter.get('/register', (req, res) => {
    res.render('pages/register.twig');
});

// Route pour afficher le formulaire d'inscription du manager
managerRouter.get('/managerRegister', (req, res) => {
    res.render('pages/managerRegister.twig');
});

// Route pour afficher le formulaire d'inscription du joueur
managerRouter.get('/playerRegister', (req, res) => {
    res.render('pages/playerRegister.twig');
});

// Route pour afficher le formulaire de connexion
managerRouter.get('/login', (req, res) => {
    res.render('pages/login.twig');
});

// Route pour se déconnecter
managerRouter.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Route pour traiter l'inscription du manager
managerRouter.post('/managerRegister', upload.single('photo'), async (req, res) => {
    try {
        // Vérifiez si le nom d'utilisateur ou l'email existe déjà
        const existingUser = await managerModel.findOne({ 
            $or: [{ username: req.body.username }, { email: req.body.email }] 
        });

        if (existingUser) {
            return res.render('pages/managerRegister.twig', {
                error: 'Le nom d\'utilisateur ou l\'email est déjà utilisé.',
                formData: req.body // Pour préremplir le formulaire
            });
        }

        // Créez un nouvel utilisateur
        const newManager = new managerModel({
            ...req.body,
            photo: req.file.path // Chemin de la photo téléchargée
        });

        // Validez et enregistrez le nouvel utilisateur
        await newManager.validate();
        await newManager.save();

        // Redirigez vers la page de connexion
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.render('pages/managerRegister.twig', {
            error: 'Une erreur est survenue. Veuillez réessayer.',
            formData: req.body // Pour préremplir le formulaire
        });
    }
});

managerRouter.post('/deletePlayer/:id', authGuard, async (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Accès refusé');
    }
    try {
        await playerModel.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression du joueur');
    }
});




module.exports = managerRouter;
