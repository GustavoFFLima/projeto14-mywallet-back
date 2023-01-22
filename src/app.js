import express from "express"
import cors from "cors"
import authRouter from "./routes/AuthRoutes.js"
import myWalletRoutes from "./routes/MyWalletRoutes.js"

const app = express()
app.use(express.json())
app.use(cors())

app.use( [ authRouter, myWalletRoutes ] )

app.listen(5000, () => {
  console.log('Servidor iniciou!!!')
})