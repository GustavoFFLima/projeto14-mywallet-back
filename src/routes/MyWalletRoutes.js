import {
    myWallet,
    novaEntrada,
    novaSaida
} from "../controller/MyWallet.js"
import { Router } from "express"

const myWalletRouter = Router()

// Rotas da carteira 

myWalletRouter.get("/home", myWallet)
myWalletRouter.post("/nova-entrada", novaEntrada)
myWalletRouter.post("/nova-saida", novaSaida)

export default myWalletRouter