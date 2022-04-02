import request from 'supertest'
import chai, { expect } from 'chai'
import chaiExclude from 'chai-exclude'
import chaiUuid from 'chai-uuid'

import app from '../server'

chai.use(chaiExclude)
chai.use(chaiUuid)

describe('GET /api', () => {
  it('responds with 404', async () => {
    // when
    const response = await request(app)
      .get('/api')
      .set('Accept', 'application/json')

    // then
    expect(response.status).to.equal(404)
  })
})

describe('GET /api/sessions', () => {
  it('responds with empty json array when there are no recorded sessions', async () => {
    // when
    const response = await request(app)
      .get('/api/sessions')
      .set('Accept', 'application/json')

    // then
    expect(response.headers['content-type']).to.match(/json/)
    expect(response.status).to.equal(200)
    expect(response.body).to.eql([])
  })

  it('responds with recorded sessions in json array', async () => {
    // given
    const session = {
      name: 'test session',
      time: 2,
      createdAt: new Date(),
    }

    const postResponse = await request(app)
      .post('/api/sessions')
      .send(session)
      .set('Accept', 'application/json')

    const expectedResponse = [
      {
        ...session,
        createdAt: session.createdAt.toISOString(),
        id: `sessions-${postResponse.body.timer.id}`,
      },
    ]

    // when
    const response = await request(app)
      .get('/api/sessions')
      .set('Accept', 'application/json')

    // then
    expect(response.headers['content-type']).to.match(/json/)
    expect(response.status).to.equal(200)
    expect(response.body).to.eql(expectedResponse)
  })
})

describe('POST /api/sessions', () => {
  it('responds with session including session id when body is correct', async () => {
    // given
    const session = {
      name: 'test session',
      time: 2,
      createdAt: new Date(),
    }

    const expectedSession = {
      ...session,
      createdAt: session.createdAt.toISOString(),
    }

    // when
    const response = await request(app)
      .post('/api/sessions')
      .send(session)
      .set('Accept', 'application/json')

    // then
    expect(response.headers['content-type']).to.match(/json/)
    expect(response.status).to.equal(200)
    expect(response.body).to.have.property('timer')
    expect(response.body.timer).excluding('id').to.eql(expectedSession)
    expect(response.body.timer.id).to.be.a.uuid('v4')
  })

  // TCQ-9
  it('responds with 400 when body is incorrect', async () => {
    // given
    const session = {}

    // when
    const response = await request(app)
      .post('/api/sessions')
      .send(session)
      .set('Accept', 'application/json')

    // then
    expect(response.status).to.equal(400)
    expect(response.body).to.be.empty
  })
})
