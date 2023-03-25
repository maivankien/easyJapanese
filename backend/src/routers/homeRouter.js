const express = require('express')
const router = express.Router()

const homeController = require('../controllers/homeController')

router.get('/articles/:id', homeController.getAArticles)
router.get('/articleDay/:day', homeController.searchArticlesDay)
router.get('/newAriticle', homeController.getNewAriticle)
router.get('/type/:value', homeController.getAllType)
router.get('/articleSearch', homeController.searchAriticle)
router.get('/relatedarticles', homeController.relatedArticles)

// Translation
router.get('/translate/:id', homeController.getTranslate)
router.post('/translate', homeController.postCreateTranslate)
router.put('/translate', homeController.putUpdateTranslate)
router.delete('/translate/:id', homeController.deleteTranlate)

// Like and dislike tranlation
router.put('/like/:id', homeController.likeTranslate)
router.put('/dislike/:id', homeController.dislikeTranslate)

// router.get('/articles', homeController.getAllArticles)


module.exports = router