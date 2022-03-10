// eslint-disable-next-line prettier/prettier
import { BaseModel, belongsTo, BelongsTo, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export default class Group extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public schedule: string

  @column()
  public location: string

  @column()
  public chronic: string

  @column({ columnName: 'master_id', serializeAs: 'masterId' })
  public masterId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'masterId',
  })
  public master: BelongsTo<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'groups_users',
  })
  public players: ManyToMany<typeof User>
}
