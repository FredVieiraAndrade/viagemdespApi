const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const usuarioAPI = express.Router()

const knex = require('knex')({
    client: 'pg',
    debug: true,
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
});

usuarioAPI.post('/register', (req, res) => {
    let senhahash = bcrypt.hashSync(req.body.senha, 8)

    knex('usuario')
        .insert({
            matricula: req.body.matricula,
            nome: req.body.nome,
            email: req.body.email,
            login: req.body.login,            
            senha: senhahash,
            banco: req.body.banco,
            agencia: req.body.agencia,
            conta_corrente: req.body.conta_corrente,
            roles: req.body.roles,            
        }, ['matricula', 'nome', 'email', 'login', 'roles', 'banco', 'agencia', 'conta_corrente'])
        .then((result) => {
            let usuario = result[0]
            res.status(200).json({
                "matricula": usuario.matricula,
                "nome": usuario.nome,
                "email": usuario.email,
                "login": usuario.login,
                "roles": usuario.roles,
                "banco": usuario.banco,
                "agencia": usuario.agencia,
                "conta_corrente": usuario.conta_corrente
            })
            return
        })
        .catch(error => {
            res.status(500).json({ message: 'Erro ao registar usuário - ' + error.message })
        })

})

usuarioAPI.post('/login', (req, res) => {
    knex
        .select('*')
        .from('usuario')
        .where({ login: req.body.login })
        .then(usuarios => {
            if (usuarios.length) {
                let usuario = usuarios[0]
                let checkSenha = bcrypt.compareSync(req.body.senha, usuario.senha)
                if (checkSenha) {
                    var tokenJWT = jwt.sign({ id: usuario.id },
                        process.env.SECRET_KEY, {
                        expiresIn: 3600
                    })
                    res.status(200).json({
                        id: usuario.id,
                        login: usuario.login,
                        nome: usuario.nome,
                        roles: usuario.roles,
                        matricula: usuario.matricula,
                        banco: usuario.banco,
                        agencia: usuario.agencia,
                        conta_corrente: usuario.conta_corrente,                       
                        token: tokenJWT
                    })
                    return
                }
            }
            res.status(200).json({ message: 'Login ou senha incorretos' })
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao verificar login - ' + err.message
            })
        })
})

module.exports = usuarioAPI