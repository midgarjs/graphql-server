import { describe, it } from 'mocha'
import chai from 'chai'
import dirtyChai from 'dirty-chai'
import path from 'path'
import { request } from 'graphql-request'

/**
 * @type {Midgar}
 */
import Midgar from '@midgar/midgar'
import GraphqlServerPlugin from '../src/index'
import { GraphqlServerService } from '../src/services/graphql-server'

const expect = chai.expect
chai.use(dirtyChai)

let mid = null
const initMidgar = async () => {
  mid = new Midgar()
  await mid.start(path.join(__dirname, 'fixtures/config'))
  return mid
}

const addUserQuery = `
query AddUser($email: String!, $birthDay: Date!) {
  addUser(email: $email, birthDay: $birthDay) {
    id
    email
    birthDay
  }
}
`

const getUsersQuery = `
query getUsers {
  getUsers {
    id
    email
    birthDay
  }
}
`
const getTestQuery = `
query getTest {
  getTest
}
`
function rmd () {
  return Math.floor(Math.random() * (10000000))
}

function rmdNum (min, max) {
  return Math.floor(Math.random() * (+max - +min)) + +min
}

/**
 * Test the service plugin
 */
describe('Service', function () {
  beforeEach(async () => {
    mid = await initMidgar()
  })

  afterEach(async () => {
    await mid.stop()
    mid = null
  })

  /**
   * Test if the plugin id load
   */
  it('Plugin', async () => {
    const plugin = mid.pm.getPlugin('@midgar/graphql-server')
    expect(plugin).to.be.an.instanceof(GraphqlServerPlugin, 'Plugin is not an instance of GraphqlServerPlugin')

    // Test service
    const service = mid.getService('mid:graphqlServer')
    expect(service).to.be.an.instanceof(GraphqlServerService, 'Plugin is not an instance of GraphqlServerPlugin')
  })

  /**
   * Test request apollo server
   */
  it('Test request', async () => {
    const { baseUrl } = mid.getService('mid:express')
    const users = []

    for (let i = 0; i < 5; i++) {
      const date = rmdNum(1960, 2010) + '-' + rmdNum(10, 12) + '-' + rmdNum(10, 28) + 'T00:00:00'
      users.push({
        email: 'test+' + rmd() + '@mail.com',
        birthDay: new Date(date)
      })
    }
    const getUsersShouldResul = []
    for (const user of users) {
      // Test addUser quesy
      let res = await request(baseUrl + '/graphql', addUserQuery, {
        email: user.email,
        birthDay: user.birthDay
      })

      expect(res.addUser).to.not.be.undefined('Invalid response addUser missing !')
      expect(parseInt(res.addUser.id)).to.not.be.undefined('Missing user id !')
      expect(res.addUser.email).to.equal(user.email, 'Invalid user email !')
      expect(res.addUser.birthDay).to.equal(user.birthDay.getTime(), 'Invalid user birthDay !')
      getUsersShouldResul.push(res.addUser)

      // Test getUsers quesy
      res = await request(baseUrl + '/graphql', getUsersQuery)
      expect(res.getUsers).to.not.be.undefined('Invalid response missing getusers !')
      expect(Array.isArray(res.getUsers)).to.be.true('Invalid getusers type !')
      expect(res.getUsers).to.eql(getUsersShouldResul, 'Invalid getusers value !')

      // Test getUsers quesy
      res = await request(baseUrl + '/graphql', getTestQuery)

      expect(res.getTest).not.be.undefined('Invalid response missing getTest !')
      expect(res.getTest).to.equal('test-service-result', 'Invalid getusers value !')
    }
  })
})
