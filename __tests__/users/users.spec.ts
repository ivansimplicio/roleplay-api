import Hash from '@ioc:Adonis/Core/Hash'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'

import { UserFactory } from './../../database/factories/index'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

let token = ''
let user: User = {} as User

test.group('User', (group) => {
  test('It should create an user', async (assert) => {
    const payload = {
      username: 'test',
      email: 'test@email.com',
      password: 'senha123',
    }
    const { body } = await supertest(BASE_URL).post('/users').send(payload).expect(201)
    assert.exists(body.user, 'User undefined')
    assert.exists(body.user.id, 'Id undefined')
    assert.equal(body.user.username, payload.username)
    assert.equal(body.user.email, payload.email)
    assert.notExists(body.user.password, 'Password defined')
  })

  test('it should return 422 when email is already in use', async (assert) => {
    const { email } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email,
        username: 'username',
        password: 'senha123',
      })
      .expect(422)

    assert.exists(body.message)
    assert.exists(body.code)
    assert.exists(body.status)
  })

  test('it should return 422 when username is already in use', async (assert) => {
    const { username } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email: 'test@email.com',
        username,
        password: 'senha123',
      })
      .expect(422)

    assert.exists(body.message)
    assert.exists(body.code)
    assert.exists(body.status)
  })

  test('it should return 422 when required data is not provided', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/users').send({}).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 422 when providing an invalid email', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email: 'test@',
        username: 'username',
        password: 'senha123',
      })
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 422 when providing an invalid password', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email: 'test@email.com',
        username: 'username',
        password: 'senha',
      })
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should update na user', async (assert) => {
    const email = 'test@test.com'
    const avatar = 'https://url.com/image.png'

    const { body } = await supertest(BASE_URL)
      .put(`/users/${user.id}`)
      .send({
        email,
        avatar,
        password: user.password,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.user, 'User undefined')
    assert.equal(body.user.email, email)
    assert.equal(body.user.avatar, avatar)
    assert.equal(body.user.id, user.id)
  })

  test('it should update the password of the user', async (assert) => {
    const password = 'password123'
    const { body } = await supertest(BASE_URL)
      .put(`/users/${user.id}`)
      .send({
        email: 'other@email.com',
        avatar: user.avatar,
        password,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.user, 'User undefined')
    assert.equal(body.user.id, user.id)
    await user.refresh()
    assert.isTrue(await Hash.verify(user.password, password))
  })

  test('it should return 422 when required data is not provided', async (assert) => {
    const { id } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .send({})
      .set('Authorization', `Bearer ${token}`)
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 422 when providing an invalid email', async (assert) => {
    const { id, password, avatar } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .send({
        email: 'test@',
        password,
        avatar,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 422 when providing an invalid password', async (assert) => {
    const { id, email, avatar } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .send({
        email,
        password: 'senha12',
        avatar,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 422 when providing an invalid avatar', async (assert) => {
    const { id, email, password } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .send({
        email,
        password,
        avatar: 'url',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  group.before(async () => {
    const password = 'senha123'
    const newUser = await UserFactory.merge({ password }).create()
    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email: newUser.email, password })
      .expect(201)
    token = body.token.token
    user = newUser
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
