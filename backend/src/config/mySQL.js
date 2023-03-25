const mysql = require('mysql2/promise')

const connection = mysql.createPool({
    host: process.env.DB_MYSQL_HOST,
    port: process.env.DB_MYSQL_PORT,
    user: process.env.DB_MYSQL_USER,
    password: process.env.DB_MYSQL_PASSWORD,
    database: process.env.DB_MYSQL_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

const connectMySql = (req, res, next) => {
    req.connectMySql = connection
    connection.getConnection((err, conn) => {
        if (err) {
            console.error('Error connecting to MySQL', err)
            return
        }
        console.log('Connected to MySQL!')
        conn.release()
    })
    next()
}

module.exports = connectMySql