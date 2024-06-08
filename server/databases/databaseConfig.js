const mysql = require('mysql')
const database = mysql.createPool({
    host:'127.0.0.1',
    port: 3306,
    user:'root',
    password:'123456',
    database:'music_item',
})
module.exports = database