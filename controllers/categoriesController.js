const categoriesModel = require('../db/models/categoriesModel');
const { createSuccess, createError } = require('../utils/utils');
const redisClient = require("../config/redis");

const getCategorie = async (req, res) => {
    try {
        const categorieId = req.params.id;
        const categorie = await categoriesModel.findById(categorieId);
        
        if (!categorie) {
            return res.status(404).json(createError('Category not found'));
        }
        
        res.status(200).json(createSuccess(categorie));
    } catch (error) {
        console.error('Error getting category by ID:', error.message);
        res.status(500).json(createError('Error getting category', error.message));
    }
};

const getCategories = async (req, res) => {
    try {
        // Try to get categories from Redis
        let categoriesJson = await redisClient.get('categories');
        let categories;

        if (categoriesJson) {
            // If found in Redis, parse and return
            categories = JSON.parse(categoriesJson);
            return res.status(200).json(createSuccess(categories));
        }
        
        // If not in Redis, fetch from database
        categories = await categoriesModel.find();
        
        if (categories.length === 0) {
            return res.status(404).json(createError('No categories found'));
        }

        // Store in Redis for future requests
        await redisClient.set('categories', JSON.stringify(categories), 'EX', 3600); // Cache for 1 hour

        res.status(200).json(createSuccess(categories));
    } catch (error) {
        console.error('Error getting categories:', error.message);
        res.status(500).json(createError('Error getting categories', error.message));
    }
};

module.exports = {
    getCategories,
    getCategorie
};