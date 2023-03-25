const moment = require('moment')
const homeService = require('../services/homeService')

module.exports = {
    async getAArticles(req, res) {
        let paper = await homeService.getAPaperArticles(req.params.id)
        if (paper) {
            return res.status(200).json({
                message: "Success",
                data: paper
            })
        } else {
            return res.status(404).json({
                message: "No data found"
            })
        }
    },
    async searchArticlesDay(req, res) {
        let { page, limit } = req.query
        let isValidDate = moment(req.params.day, 'YYYY-MM-DD', true).isValid()

        if (!isValidDate) {
            return res.status(400).json({
                message: "Bad Request: Invalid date"
            })
        }
        if (!page || !limit) {
            return res.status(400).json({
                message: "Bad Request: Missing parameter"
            })
        }

        let articles = await homeService.searchArticlesDayService(req.params.day, req.query)
        if (articles) {
            return res.status(200).json({
                message: "Success",
                data: articles
            })
        } else {
            return res.status(404).json({
                message: "No data found"
            })
        }
    },
    async getNewAriticle(req, res) {
        let { page, limit } = req.query

        if (!page || !limit) {
            return res.status(400).json({
                message: "Bad Request: Missing parameter"
            })
        }
        let articles = await homeService.getNewAriticleService(req.query, req.elasticClient)

        if (articles) {
            return res.status(200).json({
                message: "Success",
                data: articles
            })
        } else {
            return res.status(404).json({
                message: "No data found"
            })
        }
    },
    async getAllType(req, res) {
        let type = await homeService.getAllTypeService(req.params.value, req.redisClient)

        if (type) {
            return res.status(200).json({
                message: "Success",
                data: type
            })
        } else {
            return res.status(404).json({
                message: "No data found"
            })
        }
    },
    async searchAriticle(req, res) {
        let { search, page, limit } = req.query

        if (!search || !page || !limit) {
            return res.status(400).json({
                message: "Bad Request: Missing parameter(s)"
            });
        }

        let ariticle = await homeService.searchAriticleService(req.query, req.elasticClient)

        if (ariticle) {
            return res.status(200).json({
                message: "Success",
                data: ariticle
            })
        } else {
            return res.status(404).json({
                message: "No matching articles found"
            })
        }
    },
    async relatedArticles(req, res) {
        let { page, limit, topic, id } = req.query

        if (!page || !limit || !topic || !id) {
            return res.status(400).json({
                message: "Bad Request: Missing parameter"
            })
        }

        let ariticle = await homeService.relatedArticlesService(req.query)
        if (ariticle) {
            return res.status(200).json({
                message: "Success",
                data: ariticle
            })
        } else {
            return res.status(404).json({
                message: "No matching articles found"
            })
        }

    },
    async postCreateTranslate(req, res) {
        let { ariticle_id, user_id, lines, language } = req.body

        if (!ariticle_id || !user_id || !lines || lines.length === 0 || !language) {
            return res.status(400).json({
                message: "Bad Request: Missting parameter"
            })
        }

        let translate = await homeService.postCreateTranslateService(req.body)

        if (translate) {
            return res.status(200).json({
                message: "Success",
                data: translate
            })
        } else {
            return res.status(401).json({
                message: "Add failed translation"
            })
        }

    },
    async putUpdateTranslate(req, res) {
        let { translate_id, user_id, lines } = req.body

        if (!translate_id || !user_id || !lines || lines.length === 0) {
            return res.status(400).json({
                message: "Bad Request: Missting parameter"
            })
        }

        let translate = await homeService.updateTranslateService(req.body)

        if (translate) {
            return res.status(200).json({
                message: "Success",
                data: translate
            })
        } else {
            return res.status(401).json({
                message: "Translation update failed"
            })
        }

    },
    async getTranslate(req, res) {
        let id = req.params.id
        let language = req.query.language

        if (!id || !language) {
            return res.status(400).json({
                message: "Bad Request: Missting parameter"
            })
        }

        let translate = await homeService.getTranslateService(id, language)

        if (translate) {
            return res.status(200).json({
                message: "Success",
                data: translate
            })
        } else {
            return res.status(404).json({
                message: "None translation"
            })
        }
    },
    async deleteTranlate(req, res) {
        let id = req.params.id
        let { user_id, ariticle_id } = req.body

        if (!id || !user_id || !ariticle_id) {
            return res.status(400).json({
                message: "Bad Request: Missting parameter"
            })
        }

        let result = await homeService.deleteTranlateService(id, req.body)

        if (result) {
            return res.status(200).json({
                message: "Success",
                data: result
            })
        } else {
            return res.status(404).json({
                message: "Delete failed translation"
            })
        }
    },
    async likeTranslate(req, res) {
        let { user_id, type } = req.body
        
        if (!user_id || !type || (type != 'like' && type != 'unlike')) {
            return res.status(400).json({
                message: "Bad Request: Missting parameter"
            })
        }
        let result = await homeService.likeTranslateService(req.params.id, req.body)

        if (result) {
            return res.status(200).json({
                message: "Success",
                data: result
            })
        } else {
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    },
    async dislikeTranslate(req, res) {
        let { user_id, type } = req.body

        if (!user_id || !type || (type != 'dislike' && type != 'undislike')) {
            return res.status(400).json({
                message: "Bad Request: Missting parameter"
            })
        }
        let result = await homeService.dislikeTranslateService(req.params.id, req.body)

        if (result) {
            return res.status(200).json({
                message: "Success",
                data: result
            })
        } else {
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    },
    async getAllArticles(req, res) {
        let papers = await homeService.getAllArticles(req.query)
        return res.status(200).json({
            message: "Success",
            data: papers
        })
    },
}