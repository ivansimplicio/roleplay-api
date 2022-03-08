import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Exception } from '@adonisjs/core/build/standalone'

export default class BadRequestException extends Exception {
  public code = 'BAD_REQUEST'

  public async handle(error: this, ctx: HttpContextContract) {
    return ctx.response
      .status(error.status)
      .send({ code: error.code, message: error.message, status: error.status })
  }
}
