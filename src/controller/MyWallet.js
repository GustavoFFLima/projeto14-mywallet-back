import { valorSchema } from "../model/ValorSchema.js"
import db from "../config/database.js"


export async function myWallet (req, res) {
    try {
        const dados = await db.collection("carteira").find().toArray()
        return res.send(dados)
    } catch (error) {
        res.status(500).send("Deu zica no servidor de banco de dados")
    }
}

export async function novaEntrada (req, res) {
    const valor = req.body
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", '')
    const operacao = "adição"

    if (!token) return res.status(422).send("Informe o token!")

    const valorSchema = joi.object({
    valor: joi.string().required(),
    descricao: joi.string().required()
    })

    const validation = valorSchema.validate(valor, { pick: ['valor', 'descricao'], abortEarly: false })

    if (validation.error) {
    const erros = validation.error.details.map((err) => {
        return err.message
    })
    return res.status(422).send(erros)
    }

    try {

    const checkSession = await db.collection("sessoes").findOne({ token })

    if (!checkSession) return res.status(401).send("Você não tem autorização para cadastrar um valor")

    const data = await db.collection("carteira").insertOne(
        { valor: valor.valor, descricao: valor.descricao, operacao, idUsuario: checkSession.idUsuario })
    console.log(data)
    res.send("ok")

    } catch (err) {
    console.log(err)
    res.status(500).send("Deu algo errado no servidor")
    }
}

export async function novaSaida (req, res) {
    const valor = req.body
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", '')
    const operacao = "subtração"

    if (!token) return res.status(422).send("Informe o token!")

    const validation = valorSchema.validate(valor, { pick: ['valor', 'descricao'], abortEarly: false })

    if (validation.error) {
    const erros = validation.error.details.map((err) => {
        return err.message
    })
    return res.status(422).send(erros)
    }

    try {

    const checkSession = await db.collection("sessoes").findOne({ token })

    if (!checkSession) return res.status(401).send("Você não tem autorização para cadastrar um valor")

    const data = await db.collection("carteira").insertOne(
        { valor: valor.valor, descricao: valor.descricao,  operacao, idUsuario: checkSession.idUsuario })
    console.log(data)
    res.send("ok")

    } catch (err) {
    console.log(err)
    res.status(500).send("Deu algo errado no servidor")
    }
}