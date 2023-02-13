const BaseHandle = require("./BaseHandle");
const url = require("url");
const qs = require("qs");
const fs = require("fs");
const cookie = require('cookie');
const formidable = require('formidable');
const mysql = require('mysql2');


class Handle extends BaseHandle {

    async showWelcomePage(req, res) {
        let html = await this.getTemplate('./view/welcomepage.html');
        res.write(html)
        res.end();
    }
    // async showFormLogin(req, res) {
    //     let html = await this.getTemplate('./view/login.html');
    //     res.write(html)
    //     res.end();
    // }

    async login(req, res) {
        if (req.method === 'GET') {
            let html = await this.getTemplate('./view/Login.html');
            res.write(html);
            return res.end();
        } else {
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
                    if (result[0].role == '0'){
                        let nameFileSessions = result[0].username + '.txt';
                        let dataSession = JSON.stringify(result[0]);

                        await this.writeFile('./sessions/' + nameFileSessions, dataSession)
                        res.setHeader('Set-Cookie','u_user=' + result[0].username);
                        res.writeHead(301, {Location: '/adminhome'});
                        return res.end()
                    }
                    else if (result[0].role == '1') {
                        let nameFileSessions = result[0].username + '.txt';
                        let dataSession = JSON.stringify(result[0]);

                        await this.writeFile('./sessions/' + nameFileSessions, dataSession)
                        res.setHeader('Set-Cookie', 'u_user=' + result[0].username);
                        res.writeHead(301, {Location: '/home'});
                        return res.end()
                    }
                }
            })
        }
    }
    async showAdminHome(req, res) {
        let html = await this.getTemplate('./view/adminhome.html');
        let sql = 'SELECT toyId, name, categoryId, countryId, age, description, image, price FROM toys';
        let toys = await this.querySQL(sql);
        let newHTML = '';

        toys.forEach((toy, index) => {
            newHTML += '<div class="products">';
            newHTML += `<div class="product">`;
            newHTML += `<img src="/upload/${toy.image}" alt="Product 1 Image">`;
            newHTML += `<div class="product-info">`;
            newHTML += `<h2>${toy.name}</h2>`;
            newHTML += `<p>${toy.description}</p>`;
            newHTML += `<ul>`;
            newHTML += `<li>${(toy.categoryId === 1) ? 'LEGO' : 'Others'}</li>`;
            newHTML += `<li>${(toy.countryId === 1) ? 'USA' : 'China'}</li>`;
            newHTML += `<li>${toy.age}</li>`;
            newHTML += `</ul>`;
            newHTML += `<p>${toy.price} VND</p>`;
            newHTML += `<button>Add to Cart</button>`;
            newHTML += '</div>';
            newHTML += '</div>';
            newHTML += '</div>';
        });
        html = html.replace('{list-toy}', newHTML)
        res.end(html);
    }
    async showHome(req, res) {
        let html = await this.getTemplate('./view/home.html');
        let sql = 'SELECT toyId, name, categoryId, countryId, age, description, image, price FROM toys';
        let toys = await this.querySQL(sql);
        let newHTML = '';

        toys.forEach((toy, index) => {
            newHTML += '<div class="products">';
            newHTML += `<div class="product">`;
            newHTML += `<img src="/upload/${toy.image}" alt="Product 1 Image">`;
            newHTML += `<div class="product-info">`;
            newHTML += `<h2>${toy.name}</h2>`;
            newHTML += `<p>${toy.description}</p>`;
            newHTML += `<ul>`;
            newHTML += `<li>${(toy.categoryId === 1) ? 'LEGO' : 'Others'}</li>`;
            newHTML += `<li>${(toy.countryId === 1) ? 'USA' : 'China'}</li>`;
            newHTML += `<li>${toy.age}</li>`;
            newHTML += `</ul>`;
            newHTML += `<p>${toy.price} VND</p>`;
            newHTML += `<button>Add to Cart</button>`;
            newHTML += '</div>';
            newHTML += '</div>';
            newHTML += '</div>';
        });
        html = html.replace('{list-toy}', newHTML)
        res.end(html);
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
                            <a onclick="return confirm('Are you sure you want to delete this user?')" href="/userspage/delete?id=${user.userId}" class="btn btn-danger">Delete</a>
                            <a href="/userspage/update?id=${user.userId}" class="btn btn-primary">Update</a>
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
        res.writeHead(301, {Location: '/userspage'});
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
            res.writeHead(301, {Location: '/userspage'});
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
            res.writeHead(301, {Location: '/userspage'});
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

    async showListToys(req, res) {
        let html = await this.getTemplate('./view/toys/list.html');
        let sql = 'SELECT toyId, name, categoryId, countryId, age, description, image, price FROM toys';
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
            newHTML += `<td><img width="150" height="150" src="/upload/${toy.image}"></td>`;
            newHTML += `<td>${toy.price}</td>`;

            newHTML += `<td>
                     <a onclick="return confirm('Are you sure you want to delete this Toy?')" href="/toypage/delete?id=${toy.toyId}" class="btn btn-danger">Delete</a>
                        <a href="/toypage/update?id=${toy.toyId}" class="btn btn-primary">Update</a>
                    </td>`;
            newHTML += '</tr>';
        });
        html = html.replace('{list-toy}', newHTML)
        res.end(html);
    }
    async showFormAddToy(req, res) {
        if(req.method==='GET'){
            let html=await this.getTemplate('./view/toys/add.html');
            res.write(html);
            res.end();
        }else{
            let form = new formidable.IncomingForm();
            form.uploadDir='./upload/';
            form.parse(req,async(err,fields,files)=>{
                let newProduct={
                    name:fields.name,
                    categoryId:fields.categoryId,
                    countryId:fields.countryId,
                    image:files.image.originalFilename,
                    description:fields.description,
                    age:fields.age,
                    price:fields.price,
                };
                let sql=`call addToy('${newProduct.name}','${newProduct.categoryId}','${newProduct.countryId}','${newProduct.age}','${newProduct.description}','${newProduct.image}','${newProduct.price}')`;
                await this.querySQL(sql);
                let tmpPath = files.image.filepath;
                let desPath = form.uploadDir + files.image.originalFilename;
                fs.rename(tmpPath, desPath, (err) => {
                    if (err) console.log(err);
                });
                res.writeHead(301, { Location: "/toypage" });
                res.end();
            })
        }
    }
    //     let html = await this.getTemplate('./view/toys/add.html');
    //     res.write(html)
    //     res.end();
    // }
    // async storeToy(req, res) {
    //     // lay du  lieu tu  form addToy
    //     let data = '';
    //     req.on('data', chunk => {
    //         data += chunk
    //     })
    //     req.on('end', async () => {
    //         let dataForm = qs.parse(data);
    //         console.log(dataForm)
    //
    //         let sql = `CALL addToy('${dataForm.name}','${dataForm.categoryId}', '${dataForm.countryID}', '${dataForm.age}', '${dataForm.description}', '${dataForm.image}', '${dataForm.price}')`;
    //         await this.querySQL(sql);
    //         res.writeHead(301, {Location: '/toypage'});
    //         res.end();
    //     })
    // }

    async showFormUpdateToy(req, res){
        let html = await this.getTemplate('./view/toys/update.html');
        let query = url.parse(req.url).query;
        let id = qs.parse(query).id;
        let sql = 'SELECT * FROM toys WHERE toyId = ' + id;
        let data = await this.querySQL(sql);

        html = html.replace('{name}', data[0].name)
        html = html.replace('{categoryId}', data[0].categoryId)
        html = html.replace('{countryId}', data[0].countryId)
        html = html.replace('{age}', data[0].age)
        html = html.replace('{description}', data[0].description)
        html = html.replace('{image2}', data[0].image2)
        html = html.replace('{price}', data[0].price)
        html = html.replace('{id}', data[0].toyId)
        res.write(html)
        res.end();
    }
    async updateToy(req, res) {
        let query = url.parse(req.url).query;
        let id = qs.parse(query).id;

        let Form = new formidable.IncomingForm();
        Form.uploadDir='./upload/';
        Form.parse(req,async(err,fields,files)=>{
            let newProduct={
                name:fields.name,
                categoryId:fields.categoryId,
                countryId:fields.countryId,
                image:files.image.originalFilename,
                description:fields.description,
                age:fields.age,
                price:fields.price,
            };
            let sql=`call updatetoy('${id}','${newProduct.name}','${newProduct.categoryId}','${newProduct.countryId}','${newProduct.age}','${newProduct.description}','${newProduct.image}','${newProduct.price}')`;
            await this.querySQL(sql);

            let tmpPath = files.image.filepath;
            let desPath = Form.uploadDir + files.image.originalFilename;
            fs.rename(tmpPath, desPath, (err) => {
                if (err) console.log(err);
            });
            res.writeHead(301, { Location: "/toypage" });
            res.end();
        })
        // let query = url.parse(req.url).query;
        // let id = qs.parse(query).id;
        //
        // // lay du  lieu tu  form
        // let data = '';
        // req.on('data', chunk => {
        //     data += chunk
        // })
        // req.on('end', async () => {
        //     let dataForm = qs.parse(data);
        //     console.log(dataForm)
        //
        //     let sql = `CALL updatetoy ('${id}' ,'${dataForm.name}','${dataForm.categoryId}','${dataForm.countryId}','${dataForm.age}','${dataForm.description}','${dataForm.image}', '${dataForm.price}')`;
        //     await this.querySQL(sql);
        //     res.writeHead(301, {Location: '/toypage'});
        //     res.end();
        // })
    }
    async deleteToy(req, res) {
        let query = url.parse(req.url).query;
        console.log(query)
        let id = qs.parse(query).id;
        console.log(id)
        let sql = 'DELETE FROM toys WHERE toyId = ' + id;
        await this.querySQL(sql);
        res.writeHead(301, {Location: '/toypage'});
        res.end();
    }
}


module.exports = new Handle();