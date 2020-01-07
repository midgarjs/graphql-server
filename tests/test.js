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
query AddUser($email: String!) {
  addUser(email: $email) {
    id
    email
  }
}
`

const getUsersQuery = `
query getUsers {
  getUsers{
    id
    email
    }
  }
`

function rmd () {
  return Math.floor(Math.random() * (10000000))
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
    expect(plugin).be.an.instanceof(GraphqlServerPlugin, 'Plugin is not an instance of GraphqlServerPlugin')

    // Test service
    const service = mid.getService('mid:graphqlServer')
    expect(service).be.an.instanceof(GraphqlServerService, 'Plugin is not an instance of GraphqlServerPlugin')
  })

  /**
   * Test request apollo server
   */
  it('Test request', async () => {
    const { baseUrl } = mid.getService('mid:express')
    const emails = [
      'test+' + rmd() + '@mail.com',
      'test+' + rmd() + '@mail.com',
      'test+' + rmd() + '@mail.com',
      'test+' + rmd() + '@mail.com',
      'test+' + rmd() + '@mail.com'
    ]

    const getUsersShouldResul = []
    for (const index in emails) {
      const email = emails[index]
      const id = parseInt(index) + 1

      // Test addUser quesy
      let res = await request(baseUrl + '/graphql', addUserQuery, {
        email
      })

      expect(res.addUser).to.not.be.undefined('Invalid response addUser missing !')
      expect(parseInt(res.addUser.id)).equal(id, 'Invalid user id !')
      expect(res.addUser.email).equal(email, 'Invalid user email !')

      getUsersShouldResul.push(res.addUser)

      // Test getUsers quesy
      res = await request(baseUrl + '/graphql', getUsersQuery)
      expect(res.getUsers).not.be.undefined('Invalid response missing getusers !')
      expect(Array.isArray(res.getUsers)).be.true('Invalid getusers type !')
      expect(res.getUsers).eql(getUsersShouldResul, 'Invalid getusers value !')
    }
  })
})
