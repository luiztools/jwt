//index.js
require("dotenv-safe").config();
const jwt = require('jsonwebtoken');

const http = require('http');
const express = require('express');
const app = express();

const blacklist = [];

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
  res.json({ message: "Tudo ok por aqui!" });
})

app.get('/clientes', verifyJWT, (req, res, next) => {
  console.log("Retornou todos clientes!");
  res.json([{ id: 1, nome: 'luiz' }]);
})

function verifyJWT(req, res, next) {
  var token = req.headers['x-access-token'];
  if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

  const index = blacklist.findIndex(item => item === token);
  if(index !== -1) return res.status(401).end();

  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) return res.status(401).json({ auth: false, message: 'Failed to authenticate token.' });

    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id;
    next();
  });
}

app.post('/login', (req, res, next) => {
  //esse teste abaixo deve ser feito no seu banco de dados
  if (req.body.user === 'luiz' && req.body.pwd === '123') {
    //auth ok
    const userId = 1; //esse id viria do banco de dados
    const token = jwt.sign({ userId }, process.env.SECRET, {
      expiresIn: 300 // expires in 5min
    });
    return res.json({ auth: true, token: token });
  }

  res.status(401).json({ message: 'Login inválido!' });
})

app.post('/logout', function (req, res) {
  blacklist.push(req.headers['x-access-token']);
  res.json({ auth: false, token: null });
})

const server = http.createServer(app);
server.listen(3000);
console.log("Servidor escutando na porta 3000...")