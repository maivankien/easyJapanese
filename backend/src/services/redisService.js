const client = require('../config/redisDB')

module.exports = {
    setPromise: ({ key, value }) => {
        return new Promise((resolve, reject) => {
            if (!key || !value) {
                reject(new Error('Invalid key or value'))
            } else {
                console.log('set')
                client.set(key, value, (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(res)
                    }
                })
                console.log('set 2')
            }
        })
    },
    getPromise: (key) => {
        console.log(key)
        return new Promise((resolve, reject) => {
            if (!key) {
                reject(new Error('Invalid key'))
            } else {
                client.get(key, (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(res)
                    }
                })
            }
        })
    }
}
