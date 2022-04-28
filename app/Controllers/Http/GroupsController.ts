import BadRequest from 'App/Exceptions/BadRequestException'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Group from 'App/Models/Group'
import CreateGroup from 'App/Validators/CreateGroupValidator'

export default class GroupsController {
  public async index({ request, response }: HttpContextContract) {
    const { text, user: userId } = request.qs()
    const page = request.input('page', 1)
    const limit = request.input('limit', 5)
    const groupsQuery = this.filterByQueryString(userId, text)
    const groups = await groupsQuery.paginate(page, limit)
    return response.ok({ groups })
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateGroup)
    const group = await Group.create(payload)
    await group.related('players').attach([payload.masterId])
    await group.load('players')
    return response.created({ group })
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = request.param('id')
    const payload = request.all()
    const group = await Group.findOrFail(id)
    await bouncer.authorize('updateGroup', group)
    const updatedGroup = await group.merge(payload).save()
    return response.ok({ group: updatedGroup })
  }

  public async removePlayer({ request, response }: HttpContextContract) {
    const groupId = +request.param('groupId')
    const playerId = +request.param('playerId')
    const group = await Group.findOrFail(groupId)
    if (playerId === group.masterId) {
      throw new BadRequest('cannot remove master from group', 400)
    }
    await group.related('players').detach([playerId])
    return response.ok({})
  }

  public async destroy({ request, response, bouncer }: HttpContextContract) {
    const id = request.param('id')
    const group = await Group.findOrFail(id)
    await bouncer.authorize('deleteGroup', group)
    await group.delete()
    return response.ok({})
  }

  private filterByQueryString(userId: number, text: string) {
    if (userId && text) return this.filterByUserAndText(userId, text)
    else if (userId) return this.filterByUser(userId)
    else if (text) return this.filterByText(text)
    else return this.all()
  }

  private all() {
    return Group.query().preload('players').preload('master')
  }

  private filterByUser(userId: number) {
    return Group.query()
      .preload('players')
      .preload('master')
      .withScopes((scope) => scope.withPlayer(userId))
  }

  private filterByText(text: string) {
    return Group.query()
      .preload('players')
      .preload('master')
      .withScopes((scope) => scope.withText(text))
  }

  private filterByUserAndText(userId: number, text: string) {
    return Group.query()
      .preload('players')
      .preload('master')
      .withScopes((scope) => scope.withPlayer(userId))
      .withScopes((scope) => scope.withText(text))
  }
}
