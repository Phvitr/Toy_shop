const fs = require('fs');
const connection = require("../sql/database");
class BaseHandle {
    async getTemplate(pathFile) {
        return new Promise((resolve, reject) => {
            fs.readFile(pathFile, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                }else {
                    resolve(data);
                }
            })
        })
    }

    async querySQL(sql) {
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, result) => {
                if (err) {
                    reject(err.message)
                }else {
                    resolve(result)
                }
            })
        })
    }

    async writeFile(file, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(file, data, err => {
                if (err) {
                    reject(err)
                } else {
                    resolve('OK')
                }
            })
        })
    }
}

module.exports = BaseHandle;