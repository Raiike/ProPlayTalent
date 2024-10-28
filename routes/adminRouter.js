const express = require('express');
const adminRouter = express.Router();
const authGuard = require('../middleware/authGuard');
const upload = require('../middleware/upload'); 
const adminModel = require('../models/adminModels');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const playerModel = require('../models/playerModels');


adminRouter.post('/player/:id/delete', authGuard, async (req, res) => {
    try {
        if (req.session.user.role !== 'admin') {
            return res.status(403).send('Accès refusé'); // Vérifie si l'utilisateur est un admin
        }

        const playerId = req.params.id;
        await playerModel.findByIdAndDelete(playerId); // Supprime le joueur de la base de données

        res.redirect('/dashboard'); // Redirige vers le tableau de bord après suppression
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression du joueur');
    }
});

module.exports = adminRouter; 