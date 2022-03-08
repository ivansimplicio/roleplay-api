import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUser from 'App/Validators/CreateUserValidator'
import UpdateUser from 'App/Validators/UpdateUserValidator'

export default class UsersController {
  public async index({}: HttpContextContract) {}

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateUser)
    const user = await User.create(payload)
    return response.created({ user })
  }

  public async show({}: HttpContextContract) {}

  public async update({ request, response }: HttpContextContract) {
    const payload = await request.validate(UpdateUser)
    const id = request.param('id')
    const user = await User.findOrFail(id)
    user.merge(payload)
    await user.save()
    return response.ok({ user })
  }

  public async destroy({}: HttpContextContract) {}
}
