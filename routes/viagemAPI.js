const express = require('express')
const viagemAPI = express.Router()
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

viagemAPI.get('/viagens/:matricula', (req, res, next) => {
    let matricula = parseInt(req.params.matricula)
    knex.select('*').from('viagem')
        .where({ matricula: req.params.matricula })
        .where('situacao', '<>', 4)
        .orderBy('situacao','asc')
        .orderBy('data_inicio','asc')        
        .then(viagem => res.status(200).json(viagem))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar viagem'
            })
        })
})

viagemAPI.get('/viagem/:id', (req, res, next) => {
    let id = parseInt(req.params.id)

    knex.select('*').from('viagem')
        .where('situacao', '<>', 4)
        .where({ viagem_id: req.params.id })
        .then(viagem => res.status(200).json(viagem))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar viagem'
            })
        })
})

viagemAPI.post('/viagens', (req, res, next) => {

    knex('viagem')
        .insert({
            data_inicio: req.body.data_inicio,
            data_fim: req.body.data_fim,
            chamado: req.body.chamado,
            justificativa: req.body.justificativa,
            motivo: req.body.motivo,
            adiantamento: req.body.adiantamento,
            debito_credito: 0,
            cento_custo: 0,
            situacao: 0,
            matricula: req.body.matricula
        }, ['viagem_id'])
        .then(result => {
            let novoProd = result[0];
            res.status(201).json({ message: 'Viagem incluída com sucesso', id: novoProd.viagem_id })
        })
        .catch(error => {
            res.status(404).json({ message: 'Viagem não incluído.' + error })
        })
})

viagemAPI.put('/viagens/:id', (req, res, next) => {
    let id = parseInt(req.params.id)

    knex('viagem')
        .update({
            data_inicio: req.body.data_inicio,
            data_fim: req.body.data_fim,
            chamado: req.body.chamado,
            motivo: req.body.motivo,
            adiantamento: req.body.adiantamento,
            justificativa: req.body.justificativa
        })
        .where({ viagem_id: req.params.id })
        .then(result => {
            res.status(201).json({ message: 'Viagem alterada com sucesso' })
        })
        .catch(error => {
            res.status(404).json({ message: 'Viagem não alterado.' + error })
        })
})

viagemAPI.delete('/viagens/:id', (req, res, next) => {
    let id = parseInt(req.params.id)

    knex('viagem')
        .update({ situacao: 4 })
        .where({ viagem_id: req.params.id })
        .then(result => {
            res.status(201).json({ message: 'Viagem excluida com sucesso.' })
        })
        .catch(error => {
            res.status(404).json({ message: 'A viagem não foi exluída.' })
        })
})

viagemAPI.put('/apuracao/:id', (req, res, next) => {
    let id = parseInt(req.params.id)

    knex('viagem')
        .update({
            debito_credito: req.body.debito_credito,
            cento_custo: req.body.cento_custo,
            situacao: req.body.situacao
        })
        .where({ viagem_id: req.params.id })
        .then(result => {
            res.status(201).json({ message: 'Apuração finalizada com sucesso' })
        })
        .catch(error => {
            res.status(404).json({ message: 'Erro ao finalizar apuracao.' + error })
        })
})
/**/
module.exports = viagemAPI