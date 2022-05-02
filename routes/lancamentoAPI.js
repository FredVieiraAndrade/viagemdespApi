const express = require('express')
const lancamentoAPI = express.Router()
const jwt = require('jsonwebtoken');

const knex = require('knex')({
    client: 'pg',
    debug: true,
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
})

let checkToken = (req, res, next) => {
    let authToken = req.headers['authorization']
    if (!authToken) {
        res.status(401).json({message: 'Token de acesso requerida.'})
    }
    else {
        let token = authToken.split(' ')[1]
        req.token = token
    }

    jwt.verify(req.token, process.env.SECRET_KEY, (err, decodeToken) => {
        if(err) {
            res.status(401).json({message: 'Acesso negado.'})
            return
        }
        req.usuarioId = decodeToken.id
        next()
    })
}

lancamentoAPI.get('/lancamento/:lancamento_id', (req, res, next) => {
    let id = parseInt(req.params.viagem_id)

    knex.select('*').from('lancamento')
        .where({lancamento_id: req.params.lancamento_id })
        .then(lancamento => res.status(200).json(lancamento))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar lançamento.'
            })
        })
})

lancamentoAPI.get('/lancamentos/:viagem_id', (req, res, next) => {
    let id = parseInt(req.params.viagem_id)

    knex.select('*').from('lancamento')
        .where({viagem_id: req.params.viagem_id })
        .then(lancamento => res.status(200).json(lancamento))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar lista de lançamentos.'
            })
        })
})

lancamentoAPI.post('/lancamentos', (req, res, next) => {

    knex('lancamento')
        .insert({
            viagem_id: req.body.viagem_id,
            tipo_despesa_id: req.body.tipo_despesa_id,
            valor_despesa: req.body.valor_despesa,
            observacao: req.body.observacao
        })
        .then(result => {            
            res.status(201).json({ message: 'Lançamento incluído com sucesso' })
        })
        .catch(error => {
            res.status(404).json({ message: 'Lançamento não incluído.' })
        })
})

lancamentoAPI.put('/lancamentos/:lancamento_id', (req, res, next) => {
    let id = parseInt(req.params.lancamento_id)

    knex('lancamento')
        .update({
            tipo_despesa_id: req.body.tipo_despesa_id,
            valor_despesa: req.body.valor_despesa,
            observacao: req.body.observacao
        })
        .where({lancamento_id: req.params.lancamento_id })
        .then(result => {
            res.status(201).json({ message: 'Lançamento alterada com sucesso' })
        })
        .catch(error => {
            res.status(404).json({ message: 'lançamento não alterado.' })
        })
})

lancamentoAPI.delete('/lancamentos/:lancamento_id', (req, res, next) => {
    let id = parseInt(req.params.lancamento_id)

    knex('lancamento')
        .delete()
        .where({lancamento_id: req.params.lancamento_id })
        .then(result => {
            res.status(201).json({ message: 'Lançamento excluídio com sucesso' })
        })
        .catch(error => {
            res.status(404).json({ message: 'lançamento não excluído.' })
        })
})

module.exports = lancamentoAPI