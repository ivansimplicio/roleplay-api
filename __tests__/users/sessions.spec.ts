import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'

import { UserFactory } from './../../database/factories/index'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Session', async (group) => {
  test('it should authenticate an user', async (assert) => {
    const password = 'senha123'
    const { id, email } = await UserFactory.merge({ password }).create()
    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email, password })
      .expect(201)
    assert.isDefined(body.user, 'User undefined')
    assert.equal(body.user.id, id)
  })

  test('it should return an api token when session is created', async (assert) => {
    const password = 'senha123'
    const { id, email } = await UserFactory.merge({ password }).create()
    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email, password })
      .expect(201)
    assert.isDefined(body.token, 'Token undefined')
    assert.equal(body.user.id, id)
  })

  test('it should return 400 when credentials are not provided', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/sessions').send({}).expect(400)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 400)
  })

  test('it should return 400 when credentials are invalid', async (assert) => {
    const { email } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({
        email,
        password: 'invalidpassword',
      })
      .expect(400)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 400)
    assert.equal(body.message, 'invalid credentials')
  })

  test('it should return 200 when user signs out', async () => {
    const password = 'senha123'
    const { email } = await UserFactory.merge({ password }).create()
    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email, password })
      .expect(201)
    const apiToken = body.token

    await supertest(BASE_URL)
      .delete('/sessions')
      .set('Authorization', `Bearer ${apiToken.token}`)
      .expect(200)
  })

  test.only('it should revoke token when user signs out', async (assert) => {
    const password = 'senha123'
    const { email } = await UserFactory.merge({ password }).create()
    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email, password })
      .expect(201)
    const apiToken = body.token

    const tokenBeforeSignOut = await Database.query().select('*').from('api_tokens')
    assert.isNotEmpty(tokenBeforeSignOut)

    await supertest(BASE_URL)
      .delete('/sessions')
      .set('Authorization', `Bearer ${apiToken.token}`)
      .expect(200)

    const token = await Database.query().select('*').from('api_tokens')
    assert.isEmpty(token)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
