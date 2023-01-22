import express from "express"
import cors from "cors"
import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import joi from 'joi'
import bcrypt from 'bcrypt'
import { v4 as uuidV4 } from 'uuid'

dotenv.config()

const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db;

try {
  await mongoClient.connect()
  db = mongoClient.db()
} catch (error) {
  console.log('Deu errro no server')
}

const usuarioSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  confirmPassword: joi.string().valid(joi.ref('password')).required()
});

const server = express()

server.use(express.json())
server.use(cors())

server.post("/sign-up", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body

  const { error } = usuarioSchema.validate({ name, email, password, confirmPassword })

  if (error) {
    const errorMessages = error.details.map(err => err.message)
    return res.status(422).send(errorMessages)
  }

  const passwordHashed = bcrypt.hashSync(password, 10)

  try {
    await db.collection("usuarios").insertOne({ name, email, password: passwordHashed })
    res.status(201).send("Usuário cadastrado com sucesso!")

  } catch (error) {
    res.status(500).send(error.message)
  }
})


server.post("/", async (req, res) => {
  const { email, password } = req.body

  try {

    const checkUser = await db.collection('usuarios').findOne({ email })

    if (!checkUser) return res.status(400).send("Usuário ou senha incorretos")

    const isCorrectPassword = bcrypt.compareSync(password, checkUser.password)

    if (!isCorrectPassword) return res.status(400).send("Usuário ou senha incorretos")

    const token = uuidV4();

    await db.collection("sessoes").insertOne({ idUsuario: checkUser._id, token })

    return res.status(200).send(token)

  } catch (error) {
    res.status(500).send(error.message)
  }

})

server.get("/home", async (req, res) => {
  try {
    const dados = await db.collection("carteira").find().toArray()

    return res.send(dados)
  } catch (error) {
    res.status(500).send("Deu zica no servidor de banco de dados")
  }

})

server.post("/nova-entrada", async (req, res) => {
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
})

  server.post("/nova-saida", async (req, res) => {
    const valor = req.body
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", '')
    const operacao = "subtração"
  
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
        { valor: valor.valor, descricao: valor.descricao,  operacao, idUsuario: checkSession.idUsuario })
      console.log(data)
      res.send("ok")
  
    } catch (err) {
      console.log(err)
      res.status(500).send("Deu algo errado no servidor")
    }
})

server.listen(5000, () => {
  console.log('Servidor iniciou!!!')
})