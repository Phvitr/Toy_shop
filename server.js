const http = require('http');
const url = require('url');
const Handler = require('./controller/handle')
const qs = require("qs");
const fs = require("fs");

let mimeTypes={
    'jpg' : 'images/jpg',
    'png' : 'images/png',
    'js' :'text/javascript',
    'css' : 'text/css',
    'svg':'image/svg+xml',
    'ttf':'font/ttf',
    'woff':'font/woff',
    'woff2':'font/woff2',
    'eot':'application/vnd.ms-fontobject'
}


const server = http.createServer((req, res) => {
    const methodRequest = req.method;
    let urlPath =url.parse(req.url).pathname;
    const filesDefences = urlPath .match(/\.js|\.css|\.png|\.svg|\.jpg|\.ttf|\.woff|\.woff2|\.eot/);
    if (filesDefences) {
        const extension = mimeTypes[filesDefences[0].toString().split('.')[1]];
        res.writeHead(200, {'Content-Type': extension});
        fs.createReadStream(__dirname  + req.url).pipe(res)
    } else{
        switch (urlPath) {
            case '/':
                Handler.showWelcomePage(req, res).catch(err => {
                    console.log(err.message)
                });
                break;
            case '/login':
                if (methodRequest == 'GET') {
                    Handler.showFormLogin(req, res).catch(err => {
                        console.log(err.message)
                    })
                } else {
                    Handler.login(req, res).catch(err => {
                        console.log(err.message)
                    })
                }
                break;
            case '/login/users':
                let cookie = req.headers.cookie;

                let usernameLogin = qs.parse(cookie).u_user;
                if (!usernameLogin) {
                    res.writeHead(301, {Location: '/login'})
                    return res.end();
                }
                Handler.showListUsers(req, res).catch(err => {
                    console.log(err.message)
                });
                break;
            case '/login/userspage':
                Handler.showListUsers(req, res).catch(err => {
                    console.log(err.message)
                });
                break;
            case 'login/toypage':
                Handler.showListToys(req, res).catch(err => {
                    console.log(err.message)
                });
                break;
            case '/login/dashboard':
                Handler.showDashboard(req, res).catch(err => {
                    console.log(err.message)
                });
                break;
            case '/login/userspage/add':
                Handler.showFormAddUser(req, res).catch(err => {
                    console.log(err.message)
                })
                break;
            case '/login/userspage/store':
                Handler.storeUser(req, res).catch(err => {
                    console.log(err.message)
                })
                break;
            case '/login/userspage/delete':
                Handler.deleteUser(req, res).catch(err => {
                    console.log(err.message)
                })
                break;
            case '/login/userspage/update':
                Handler.showFormUpdateUser(req, res).catch(err => {
                    console.log(err.message)
                })
                break;
            case '/login/userspage/edit':
                Handler.updateUser(req, res).catch(err => {
                    console.log(err.message)
                })
                break;
            case '/register':
                Handler.showFormRegister(req, res).catch(err => {
                    console.log(err.message)
                })
                break;
            case '/register/store':
                Handler.storeNewUser(req, res).catch(err => {
                    console.log(err.message)
                })
                break;
            case '/founders':
                Handler.aboutUs(req, res).catch(err => {
                    console.log(err.message)
                })
                break;
            default:
                res.end();
        }
    }
})
server.listen(8000,() => {
    console.log('server listening on port' + 8000)
})