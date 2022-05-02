const express = require ('express');
require('dotenv').config()
const viagemAPI = require ('./routes/viagemAPI')
const lancamentoAPI = require ('./routes/lancamentoAPI')
const usuarioAPI = require ('./routes/usuarioAPI')
const app = express();

app.use (express.json())

app.use ((req, res, next) => {
    let data_req = new Date()
    console.log(`${data_req.toLocaleString()} - ${req.path} - ${req.get('content-type')}`)
    next()
})

app.use('/api', viagemAPI, lancamentoAPI, usuarioAPI)

const PORTA = process.env.PORT || 3000
app.listen (PORTA, () => {
    console.log (`Servidor rodando em http://localhost:${PORTA}`);
})