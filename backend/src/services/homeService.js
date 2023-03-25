require('dotenv').config()
const ariticle = require('../models/ariticle')
const likeMongoDB = require('../models/likesMongoDB')
const ariticleMongoDB = require('../models/ariticleMongoDB')
const translationMongoDB = require('../models/translationMongoDB')

const DB_NAME = process.env.DB_NAME
const EXPIRED_TIME = process.env.EXPIRED_TIME

module.exports = {
    async getAPaperArticles(id) {
        try {
            let result = await ariticle.get(id, { revs_info: false, },
                { include_docs: true, conflicts: true, endkey: [false, {}], startkey: [false] })
            return result
        } catch (error) {
            console.log(error)
            return null
        }
    },
    async searchArticlesDayService(day, queryString) {
        try {
            let { page, limit } = queryString
            let skip = (page - 1) * limit

            let date = new Date(day)
            let timestampStart = date.getTime()
            let timestampEnd = timestampStart + 86399000

            let results = await ariticle.view('search', 'index-time', {
                'start_key': timestampEnd / 1000,
                'end_key': timestampStart / 1000,
                'descending': true,
                'inclusive_end': true,
                skip,
                limit,
            })
            if (results.rows.length === 0) {
                throw new Error('No data found')
            }
            results = results.rows.map((item) => {
                return {
                    id: item.id,
                    title: item.value.title,
                    time: item.value.time,
                    img_link: item.value.img_link,
                    source: item.value.source
                }
            })
            return results
        } catch (error) {
            console.log(error)
            return null
        }
    },
    async getNewAriticleService(queryString, elasticClient) {
        try {
            let { page, limit, level, source, topic } = queryString
            let skip = (page - 1) * limit
            let query = []

            if (level) query.push({ "match": { "doc.doc.type": level } })

            if (topic) query.push({ "match": { "doc.doc.topic": topic } })

            if (source) query.push({ "match": { "doc.doc.nameLink": source } })

            let ariticle = await elasticClient.search({
                index: DB_NAME,
                body: {
                    query: {
                        bool: {
                            must: query
                        }
                    },
                    _source: ['doc._id', 'doc.doc.title', 'doc.doc.nameLink', 'doc.doc.pubDate', 'doc.doc.content.img_link'],
                    sort: [{ "doc.doc.post_date": { "order": "desc" } }],
                    size: limit,
                    from: skip
                }
            })

            if (ariticle.hits.hits.length === 0) {
                throw new Error('No data found')
            }

            let results = ariticle.hits.hits.map((value) => {
                return value._source.doc
            })
            return results
        } catch (error) {
            console.log(error)
            return null
        }
    },
    async getAllTypeService(type, redisClient) {
        try {
            let results
            let value = await redisClient.get(type)
            if (!value) {
                results = await ariticle.view('get', type, {
                    group: true
                })
                results = results.rows.map((value) => {
                    return value.key
                })

                redisClient.set(type, JSON.stringify(results))
                redisClient.expire(type, EXPIRED_TIME)
                return results
            }
            results = JSON.parse(value)
            return results
        } catch (error) {
            console.log(error)
            return null
        }
    },
    async searchAriticleService(queryString, elasticClient) {
        try {
            let { page, limit, search } = queryString
            let skip = (page - 1) * limit

            let ariticle = await elasticClient.search({
                index: DB_NAME,
                body: {
                    query: {
                        bool: {
                            should: [
                                { match: { 'doc.doc.title': search } },
                                { match: { 'doc.doc.content.content': search } },
                            ],
                        },
                    },
                    _source: ['doc._id', 'doc.doc.title', 'doc.doc.nameLink', 'doc.doc.pubDate', 'doc.doc.content.img_link'],
                    size: limit,
                    from: skip
                },
            })
            if (ariticle.hits.hits.length === 0) {
                throw new Error('No data found')
            }

            let results = ariticle.hits.hits.map((value) => {
                return value._source.doc
            })
            return results
        } catch (error) {
            console.log(error)
            return null
        }
    },
    async relatedArticlesService(queryString) {
        try {
            let { page, limit, topic, id } = queryString
            let skip = (page - 1) * limit

            let results = await ariticle.view('filter', 'topic', {
                start_key: [topic, {}],
                end_key: [topic,],
                skip, limit,
                descending: true
            })

            if (results.rows.length === 0) {
                throw new Error('No data found')
            }

            results = results.rows.filter(value => value.id !== id).map((item) => {
                return {
                    id: item.id,
                    title: item.value.title,
                    time: item.value.time,
                    img_link: item.value.img_link,
                    source: item.value.source
                }
            })
            return results
        } catch (error) {
            console.log(error)
            return null
        }
    },
    async postCreateTranslateService(data) {
        try {
            let { ariticle_id, user_id, lines, language } = data

            let translateCheck = await ariticleMongoDB.findById(ariticle_id, { translate: 1 })
                .populate('translate.translation', {
                    user_id: 1
                })

            let check = translateCheck.translate.find((item) => {
                return item.translation.user_id == user_id && item.language == language
            })

            if (check) throw new Error('You can only add 1 translation')

            let translate = await translationMongoDB.create({
                user_id, lines
            })

            let result = ariticleMongoDB.findByIdAndUpdate(
                ariticle_id,
                {
                    $push: {
                        translate: {
                            translation: translate._id,
                            language: language
                        }
                    }
                },
                { new: true }
            ).populate('translate.translation').select('translate')

            return result
        } catch (error) {
            console.log(error)
            return null
        }
    },
    async updateTranslateService(data) {
        try {
            let { translate_id, user_id, lines } = data

            let translate = await translationMongoDB.findOneAndUpdate(
                {
                    _id: translate_id,
                    user_id
                },
                { lines }, { new: true }
            )

            if (!translate) throw new Error('No translation found')

            return translate
        } catch (error) {
            console.log(error)
            return null
        }
    },
    async getTranslateService(id, language) {
        try {
            // let translate = await ariticleMongoDB.findById({ _id: id })
            //     .select('translate')
            //     .populate({ path: 'translate.translation', options: { sort: { likes: 1 } } })
            // // .sort({ 'likes': -1 })

            // if (!translate) throw new Error('None translation')

            // translate = translate.translate.filter((item) => {
            //     return item.language == language
            // })

            // if (translate.length == 0) throw new Error('None translation')

            

            console.log(translate)

            return translate
        } catch (error) {
            console.log(error)
            return null
        }
    },
    async deleteTranlateService(id, body) {
        try {
            let { user_id, ariticle_id } = body
            let result = await translationMongoDB.delete({ _id: id, user_id })
            // Kiểm tra bản dịch có được xóa thành công không
            if (result.modifiedCount == 0 && result.matchedCount == 0) throw new Error('Delete failed translation')
            // Xóa id của bản dịch khỏi bài báo
            let translate = await ariticleMongoDB.findByIdAndUpdate(ariticle_id, {
                $pull: { translate: { translation: id } }
            })
                .select('translate')
                .populate('translate.translation')

            return translate
        } catch (error) {
            console.log(error)
            return null
        }
    },
    async likeTranslateService(id, data) {
        try {
            if (data.type == 'like') {
                // Tìm xem người dùng đã like hay dislike bài báo bao giờ chưa
                let checkLike = await likeMongoDB.findOneAndUpdate({
                    user_id: data.user_id, translation_id: id
                }, { status: 1 }, { upsert: true })

                // Nếu người dùng chưa từng like hoặc chưa like
                if (!checkLike || checkLike.status === 0) {
                    let result = await translationMongoDB.findByIdAndUpdate(id, {
                        $inc: { likes: 1 }
                    }, { new: true })
                    return result
                }
                // Nếu người dùng đang dislike
                if (checkLike.status === -1) {
                    let result = await translationMongoDB.findByIdAndUpdate(id, {
                        $inc: { likes: 1, dislikes: -1 }
                    }, { new: true })
                    return result
                }
                // Trả về lỗi trường hợp đã like rồi
                return null
            }
            if (data.type == 'unlike') {
                // Tìm xem người dùng đã like hay dislike bài báo bao giờ chưa
                let checkLike = await likeMongoDB.findOneAndUpdate({
                    user_id: data.user_id, translation_id: id
                }, { status: 0 }, { upsert: true })

                if (!checkLike) throw new Error('Internal Server Error')
                // Nếu người dùng đang like
                if (checkLike.status === 1) {
                    let result = await translationMongoDB.findByIdAndUpdate(id, {
                        $inc: { likes: -1 }
                    }, { new: true })
                    return result
                }
                // Nếu người dùng đang dislike
                if (checkLike.status === -1) {
                    let result = await translationMongoDB.findByIdAndUpdate(id, {
                        $inc: { dislikes: -1 }
                    }, { new: true })
                    return result
                }
                return null
            }
        } catch (error) {
            console.log(error)
            return null
        }
    },
    async dislikeTranslateService(id, data) {
        try {
            if (data.type == 'dislike') {
                // Tìm xem người dùng đã like hay dislike bài báo bao giờ chưa
                let checkLike = await likeMongoDB.findOneAndUpdate({
                    user_id: data.user_id, translation_id: id
                }, { status: -1 }, { upsert: true })

                // Nếu người dùng chưa từng dislike hay like
                if (!checkLike || checkLike.status === 0) {
                    let result = await translationMongoDB.findByIdAndUpdate(id, {
                        $inc: { dislikes: 1 }
                    }, { new: true })
                    return result
                }
                // Nếu người dùng đang like
                if (checkLike.status === 1) {
                    let result = await translationMongoDB.findByIdAndUpdate(id, {
                        $inc: { likes: -1, dislikes: 1 }
                    }, { new: true })
                    return result
                }
                // Trả về lỗi trường hợp đã dislike rồi
                return null
            }
            if (data.type == 'undislike') {
                // Tìm xem người dùng đã like hay dislike bài báo bao giờ chưa
                let checkLike = await likeMongoDB.findOneAndUpdate({
                    user_id: data.user_id, translation_id: id
                }, { status: 0 }, { upsert: true })

                if (!checkLike) throw new Error('Internal Server Error')
                // Nếu người dùng đang dislike
                if (checkLike.status === -1) {
                    let result = await translationMongoDB.findByIdAndUpdate(id, {
                        $inc: { dislikes: -1 }
                    }, { new: true })
                    return result
                }
                // Nếu người dùng đang like
                if (checkLike.status === 1) {
                    let result = await translationMongoDB.findByIdAndUpdate(id, {
                        $inc: { likes: -1 }
                    }, { new: true })
                    return result
                }
                return null
            }
        } catch (error) {
            console.log(error)
            return null
        }
    },
    async getAllArticles(queryString) {
        try {
            const { page, limit } = queryString
            const skip = (page - 1) * limit
            // const results = await ariticle.list({ include_docs: true, fields: ['doc._id', 'doc.title', 'doc.time', 'doc.image_url'], limit, skip })
            ariticle.list({ include_docs: true }, (err, body) => {
                if (err) {
                    console.log('Error retrieving documents:', err);
                } else {
                    // body.rows.forEach((doc) => {
                    //     const updatedDoc = { ...doc.doc };
                    //     // console.log(updatedDoc)
                    //     // updatedDoc.doc.time
                    //     // updatedDoc.doc.nameLink = 'NHK'
                    //     // updatedDoc.doc.type = 'easy'
                    //     updatedDoc.doc.topic = 'Food'
                    //     ariticle.insert(updatedDoc, (err, body) => {
                    //         if (err) {
                    //             console.log('Error updating document:', err);
                    //         } else {
                    //             console.log('Document updated:', body);
                    //         }
                    //     });
                    // });
                    for (let i = 150; i < 200; i++) {
                        const updatedDoc = { ...body.rows[i].doc }
                        // updatedDoc.doc.nameLink = 'CNN'
                        // updatedDoc.doc.type = 'easy'
                        updatedDoc.doc.topic = 'Computer'
                        ariticle.insert(updatedDoc, (err, body) => {
                            if (err) {
                                console.log('Error updating document:', err);
                            } else {
                                console.log('Document updated:', body);
                            }
                        });
                    }

                    // const client = require('../config/elasticsearch')
                    // ariticle.list({ include_docs: true }, async (err, body) => {
                    //     if (err) {
                    //         console.log('Error retrieving documents:', err);
                    //     } else {
                    //         for (let i = 0; i < 50; i++) {
                    //             // const updatedDoc = { ...body.rows[i].doc }
                    //             console.log(body.rows[i])
                    //             const result = await client.index({
                    //                 index: 'ariticle',
                    //                 document: body.rows[i]
                    //             })
                    //         }
                    //     }
                    // });
                }
            });
            // return results
        } catch (error) {
            console.log(error)
            return null
        }
    },
}


