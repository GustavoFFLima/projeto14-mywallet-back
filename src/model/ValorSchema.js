import joi from "joi"

export const valorSchema = joi.object({
    valor: joi.string().required(),
    descricao: joi.string().required()
  })