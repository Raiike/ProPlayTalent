const express = require('express');
const userRouter = express.Router();
const authGuard = require('../middleware/authGuard');
const upload = require('../middleware/upload'); 
const playerModel = require('../models/playerModels');
const managerModel = require('../models/managerModels');
const adminModel = require('../models/adminModels');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

userRouter.get('/register', (req, res) => {
    res.render('pages/register.twig');
});

userRouter.get('/playerRegister', (req, res) => {
    res.render('pages/playerRegister.twig');
});

userRouter.get('/managerRegister', (req, res) => {
    res.render('pages/managerRegister.twig');
});

userRouter.get('/login', (req, res) => {
    res.render('pages/login.twig');
});

// userRouter.get('/addEmployee', authGuard, async (req, res) => {
//     res.render('pages/addEmployee.twig');
// });


userRouter.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


userRouter.post('/playerRegister', upload.single('photo'), async (req, res) => {
    console.log(req.body); // Vérification des données reçues
    console.log(req.file); // Vérification du fichier téléchargé
    console.log(req.file.path); // Vérification du chemin du fichier

    try {
        const user = await playerModel.findOne({ email: req.body.email });
        if (!user) {
            // Enregistrement du chemin de la photo sans './publics'
            let newUser = new playerModel({
                ...req.body,
                photo: req.file ? req.file.path.replace(/^\.\/publics/, '').replace('publics', '') : null // Enregistre le chemin de la photo sans './publics'
            });
            await newUser.save();
            res.redirect('/login');
        } else {
            throw new Error("Ce mail existe déjà");
        }
    } catch (error) {
        console.log(error);
        res.render('pages/playerRegister.twig', {
            error: error.message,
        });
    }
});




// Route pour gérer la connexion des joueurs
// Route pour gérer la connexion des joueurs
// Route pour gérer la connexion des joueurs et des managers
// Route pour gérer la connexion des joueurs et des managers
userRouter.post('/login', async (req, res) => {
    try {
        // Cherche l'utilisateur par e-mail ou pseudo
        let user = await playerModel.findOne({ 
            $or: [{ email: req.body.identifier }, { username: req.body.identifier }] 
        });
        // console.log(req.body.identifier);
        
        // Si non trouvé, cherche dans les managers
        if (!user) {
            user = await managerModel.findOne({ 
                $or: [{ email: req.body.identifier }, { username: req.body.identifier }] 
            });
        }

        // Si non trouvé, cherche dans les admins
        if (!user) {
            user = await adminModel.findOne({ 
                username: req.body.identifier 
            });
        }

        // Vérifie si l'utilisateur a été trouvé
        if (user) {
            // Vérifie le mot de passe
            if (bcrypt.compareSync(req.body.password, user.password)) {
                req.session.user = user; // Enregistrement de l'utilisateur dans la session
                req.session.save(() => {
                    console.log("User session:", req.session.user);
                    res.redirect('/dashboard'); // Redirection vers le tableau de bord
                });
            } else {
                throw new Error('Mot de passe incorrect'); // Gestion d'erreur si mot de passe incorrect
            }
        } else {
            throw new Error('Utilisateur non trouvé'); // Gestion d'erreur si utilisateur non trouvé
        }
    } catch (error) {
        console.log(error);
        res.render('pages/login.twig', {
            error: error.message // Affiche le message d'erreur dans le formulaire
        });
    }
});


userRouter.get('/dashboard', authGuard, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Page actuelle, par défaut à 1
        const limit = 6; // Nombre de joueurs par page
        const skip = (page - 1) * limit; // Nombre de documents à sauter

        // Récupère les paramètres de recherche et de catégorie
        const search = req.query.search ? req.query.search.trim() : '';
        const gameCategory = req.query.gameCategory || 'all';

        // Construire la requête de recherche
        const query = {};
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { firstname: { $regex: search, $options: 'i' } },
                { lastname: { $regex: search, $options: 'i' } }
            ];
        }
        if (gameCategory && gameCategory !== 'all') {
            query.gameCategory = gameCategory;
        }

        // Récupère le nombre total de joueurs correspondant aux critères de recherche
        const totalPlayers = await playerModel.countDocuments(query);
        const totalPages = Math.ceil(totalPlayers / limit);

        // Récupère les joueurs pour la page actuelle avec les critères de recherche
        const players = await playerModel.find(query).skip(skip).limit(limit);

        res.render('pages/dashboard.twig', {
            players,
            user: req.session.user,
            currentPage: page,
            totalPages,
            search,
            gameCategory
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la récupération des joueurs');
    }
});




userRouter.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

userRouter.get('/player/:id', authGuard, async (req, res) => {
    try {
        const player = await playerModel.findById(req.params.id); // Récupère le joueur par ID
        if (!player) {
            return res.status(404).send('Joueur non trouvé');
        }

        // Vérifie si l'utilisateur connecté est le même que le joueur consulté
        const isCurrentUser = req.session.user._id.toString() === player._id.toString();

        // Passe les données du joueur et l'état de l'utilisateur actuel à la vue
        res.render('pages/playerDetail.twig', { player, isCurrentUser, user: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des informations du joueur');
    }
});



userRouter.post('/player/edit/:id', upload.single('photo'), async (req, res) => {
    try {
        const player = await playerModel.findById(req.params.id);
        if (!player) {
            return res.status(404).send('Joueur non trouvé');
        }

        // Mettez à jour les informations du joueur
        player.firstname = req.body.firstname || player.firstname;
        player.lastname = req.body.lastname || player.lastname;
        player.age = req.body.age || player.age;
        player.nationality = req.body.nationality || player.nationality;
        player.phonenumber = req.body.phonenumber || player.phonenumber;
        player.gameCategory = req.body.gameCategory || player.gameCategory;
        player.earnings = req.body.earnings || player.earnings;

        // Si une nouvelle photo est téléchargée, mettez à jour le chemin
        if (req.file) {
            player.photo = req.file.path.replace(/^\.\/publics/, '').replace('publics', '');
        }

        await player.save();
        res.redirect(`/player/${player._id}`); // Redirige vers la page de détails du joueur
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la mise à jour des informations du joueur');
    }
});






module.exports = userRouter; 