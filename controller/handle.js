const BaseHandle = require("./BaseHandle");
const url = require("url");
const qs = require("qs");
const fs = require("fs");
const cookie = require('cookie');


class Handle extends BaseHandle {

    async showWelcomePage(req, res) {
        let html = await this.getTemplate('./view/welcomepage.html');
        res.write(html)
        res.end();
    }
    async showFormLogin(req, res) {
        let html = await this.getTemplate('./view/login.html');
        res.write(html)
        res.end();
    }

    async login(req, res) {
        let data = '';
        req.on('data', chunk => {
            data += chunk
        })
        req.on('end', async () => {
            let dataForm = qs.parse(data);
            let sql = `SELECT name, username, role, email, phone, address
                       FROM users
                       WHERE username = '${dataForm.username}'
                         AND password = '${dataForm.password}'`;
            let result = await this.querySQL(sql);
            if (result.length == 0) {
                res.writeHead(301, {Location: '/login'})
                return res.end();
            } else {
                // tao session luu thong tin dang nhap
                // tao ten file session
                let nameFileSessions = result[0].username + '.txt';
                let dataSession = JSON.stringify(result[0]);

                await this.writeFile('./sessions/' + nameFileSessions, dataSession)

                // tao cookie
                // gan cookie vao header res
                res.setHeader('Set-Cookie', 'u_user=' + result[0].username);

                res.writeHead(301, {Location: '/login/userspage'});
                return res.end()
            }
        })
    }

    async showDashboard(req, res) {
        let html = await this.getTemplate('./view/welcomepage.html');
        res.write(html)
        res.end();
    }

    async showListUsers(req, res) {
        let html = await this.getTemplate('./view/users/list.html');
        let sql = 'SELECT userId, name, username, role, age, email, phone, address FROM users';
        let users = await this.querySQL(sql);
        let newHTML = '';
        users.forEach((user, index) => {
            newHTML += '<tr>';
            newHTML += `<td>${index + 1}</td>`;
            newHTML += `<td>${user.name}</td>`;
            newHTML += `<td>${user.username}</td>`;
            newHTML += `<td>${(user.role === 0) ? 'admin' : 'user'}</td>`;
            newHTML += `<td>${user.age}</td>`;
            newHTML += `<td>${user.email}</td>`;
            newHTML += `<td>${user.phone}</td>`;
            newHTML += `<td>${user.address}</td>`;
            newHTML += `<td>
                            <a onclick="return confirm('Are you sure you want to delete this user?')" href="/login/userspage/delete?id=${user.userId}" class="btn btn-danger">Delete</a>
                            <a href="/login/userspage/update?id=${user.userId}" class="btn btn-primary">Update</a>
                        </td>`;
            newHTML += '</tr>';
        });
        html = html.replace('{list-user}', newHTML)
        res.write(html)
        res.end();
    }

    async showListToys(req, res) {
        let html = await this.getTemplate('./view/users/list.html');
        let sql = 'SELECT toyId, name, categoryId, countryId, age, description, image, price FROM users';
        let toys = await this.querySQL(sql);
        let newHTML = '';
        toys.forEach((toy, index) => {
            newHTML += '<tr>';
            newHTML += `<td>${index + 1}</td>`;
            newHTML += `<td>${toy.name}</td>`;
            newHTML += `<td>${toy.categoryId}</td>`;
            newHTML += `<td>${toy.countryId}</td>`;
            newHTML += `<td>${toy.age}</td>`;
            newHTML += `<td>${toy.description}</td>`;
            newHTML += `<td>${toy.image}</td>`;
            newHTML += `<td>${toy.price}</td>`;

            newHTML += `<td>
                            <a onclick="return confirm('Are you sure you want to delete this user?')" href="/login/userspage/delete?id=${user.id}" class="btn btn-danger">Delete</a>
                            <a href="/login/userspage/update?id=${user.id}" class="btn btn-primary">Update</a>
                        </td>`;
            newHTML += '</tr>';
        });
        html = html.replace('{list-user}', newHTML)
        res.write(html)
        res.end();
    }

    async deleteUser(req, res) {
        let query = url.parse(req.url).query;
        let id = qs.parse(query).id;
        let sql = 'DELETE FROM users WHERE userId = ' + id;
        await this.querySQL(sql);
        res.writeHead(301, {Location: '/login/userspage'});
        res.end();
    }

    async showFormAddUser(req, res) {
        let html = await this.getTemplate('./view/users/add.html');
        res.write(html)
        res.end();
    }

    async storeUser(req, res) {
        let data = '';
        req.on('data', chunk => {
            data += chunk
        })
        req.on('end', async () => {
            let dataForm = qs.parse(data);
            let sql = `CALL addUser('${dataForm.name}','${dataForm.username}', '${dataForm.password}', '${dataForm.role}', '${dataForm.age}', '${dataForm.email}', '${dataForm.phone}', '${dataForm.address}')`;
            await this.querySQL(sql);
            res.writeHead(301, {Location: '/login/userspage'});
            res.end();
        })
    }

    async showFormUpdateUser(req, res) {
        let html = await this.getTemplate('./view/users/update.html');
        let query = url.parse(req.url).query;
        let id = qs.parse(query).id;
        let sql = 'SELECT * FROM users WHERE userId = ' + id;
        let data = await this.querySQL(sql);
        html = html.replace('{name}', data[0].name)
        html = html.replace('{username}', data[0].username)
        html = html.replace('{password}', data[0].password)
        html = html.replace('{age}', data[0].age)
        html = html.replace('{email}', data[0].email)
        html = html.replace('{address}', data[0].address)
        html = html.replace('{phone}', data[0].phone)
        html = html.replace('{id}', data[0].userId)

        let roleHTML = `
            <option ${(data[0].role == 0) ? 'selected' : ''} value="0">Admin</option>
            <option ${(data[0].role == 1) ? 'selected' : ''} value="1">User</option>
        `;

        html = html.replace('{role}', roleHTML)
        res.write(html)
        res.end();
    }

    async updateUser(req, res) {
        let query = url.parse(req.url).query;
        let id = qs.parse(query).id;

        let data = '';
        req.on('data', chunk => {
            data += chunk
        })
        req.on('end', async () => {
            let dataForm = qs.parse(data);
            console.log(dataForm)

            let sql = `CALL updateUser('${id}','${dataForm.name}','${dataForm.username}','${dataForm.role}','${dataForm.age}','${dataForm.email}','${dataForm.address}', '${dataForm.phone}')`;
            await this.querySQL(sql);
            res.writeHead(301, {Location: '/login/userspage'});
            res.end();
        })
    }
    async showFormRegister(req, res) {
        let html = await this.getTemplate('./view/signupform.html');
        res.write(html)
        res.end();
    }
    async storeNewUser(req, res) {
        let NewData = '';
        req.on('data', chunk => {
            NewData += chunk
        })
        req.on('end', async () => {
            let NewDataForm = qs.parse(NewData);
            let sql = `CALL addUser('${NewDataForm.name}','${NewDataForm.username}', '${NewDataForm.password}', 1, '${NewDataForm.age}', '${NewDataForm.email}', '${NewDataForm.phone}', '${NewDataForm.address}')`;
            await this.querySQL(sql);
            res.writeHead(301, {Location: '/login'});
            res.end();
        })
    }
    async aboutUs(req, res) {
        let html = await this.getTemplate('./view/aboutus.html');
        res.write(html)
        res.end();
    }
}


module.exports = new Handle();