
import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-express'
import { merge } from 'lodash'

import utils from '@midgar/utils'
import { MODULE_TYPE_KEY } from '../index'

/**
 * Service name
 * @type {string}
 */
const name = 'mid:graphqlServer'

const baseTypeDefs = gql`
type Query {
  version: String
}

type Mutation {
  _empty: String
}
`
const dependencies = ['mid:express']

/**
 * GraphqlServerService class
 */
class GraphqlServerService {
  constructor (mid, expressService) {
    /**
     * Midgar instance
     * @var {Midgar}
     */
    this.mid = mid

    /**
     * Apollo server instance
     * @type {ApolloServer}
     */
    this.server = null

    /**
     * Config
     * @type {object}
     */
    this.config = merge({}, this.mid.config.graphqlServer || {}, {})

    /**
     * Express service
     * @type {ExpressService}
     */
    this.expressService = expressService

    if (this.config.path !== undefined && typeof this.config.path !== 'string') throw new TypeError('Invalid config path type !')
    if (this.config.options !== undefined && typeof this.config.options !== 'object') throw new TypeError('Invalid config options type !')
  }

  /**
   * Load graphql modules and start apollo server
   */
  async start () {
    utils.timer.start('midgar-start-apollo-server')
    this.mid.debug('@midgar/graphql-server: Apollo start !')

    /**
     * beforeStart event.
     * @event @midgar/graphql-server:beforeStart
     */
    await this.mid.emit('@midgar/graphql-server:beforeStart', this)

    const schema = await this._getExecutableSchema()
    this._createApolloInstance(schema)

    const time = utils.timer.getTime('midgar-start-apollo-server')
    this.mid.debug(`@midgar/graphql-server: Apollo start in ${time} ms`)

    /**
     * afterStart event.
     * @event @midgar/graphql-server:afterStart
     */
    await this.mid.emit('@midgar/graphql-server:afterStart', this)
  }

  async _context ({ req, res }) {
    const context = {
      req,
      res
    }

    /**
       * context event.
       * @event @midgar/graphql-server:context
       */
    await this.mid.emit('@midgar/graphql-server:context', context)
    return context
  }

  /**
   * Create apollo serveur instance
   *
   * @param {ApolloSchema} schema Apollo executable schema
   * @private
   */
  _createApolloInstance (schema) {
    const cors = this.config.cors !== undefined ? this.config.cors : false
    const options = this.config.options !== undefined ? this.config.options : {}

    // Add query middleware
    // app.use(query())

    // Create server instance
    this.server = new ApolloServer(merge(options, {
      schema: schema,
      cors,
      context: (...args) => this._context(...args),
      formatError: (err) => {
        if (!err.extensions || !err.extensions.code || err.extensions.code !== 'UNAUTHENTICATED') {
          this.mid.error(err)
          this.mid.error(err.extensions.exception.stacktrace)
        }
        return err
      },
      playground: this.mid.getNodeEnv() === 'development'
    }))

    // Apply apollo middleware
    const path = this.config.path !== undefined ? this.config.path : '/graphql'
    this.server.applyMiddleware({ app: this.expressService.app, path, cors })
  }

  /**
   * Load files in graphql plugin folders
   *
   * @returns {ApolloSchema}
   * @private
   */
  async _getExecutableSchema () {
    this.mid.debug('@midgar/graphql-server: Load modules...')

    const schmaDef = {
      typeDefs: [baseTypeDefs],
      resolvers: {},
      schemaDirectives: {}
    }

    // Import graphql module files
    const files = await this.mid.pm.importModules(MODULE_TYPE_KEY)
    for (const file of files) {
      try {
        await this._loadModule(file, schmaDef)
      } catch (error) {
        this.mid.debug(`@midgar/graphql-server: Invalid graphql module: ${file.path} !`)
        this.mid.error(error)
      }
    }

    this.mid.debug('@midgar/graphql: Load modules finish.')
    return makeExecutableSchema(schmaDef)
  }

  /**
   * Load a graphql module
   *
   * @param {object} file     Module file object
   * @param {object} schmaDef Chema definition object
   *
   * @return {object}
   * @private
   */
  async _loadModule (file, schmaDef) {
    this.mid.debug(`@midgar/graphql-server: Load graphql module: ${file.path}.`)
    // Check file export
    const moduleDef = await file.export

    let graphqlModule = null
    if (typeof moduleDef.graphql === 'function') {
      graphqlModule = await moduleDef.graphql(...this._getModuleArgs(moduleDef))
    } else if (typeof moduleDef.graphql === 'object') {
      graphqlModule = moduleDef.graphql
    } else {
      throw new Error(`@midgar/graphql-server: Invalid graphql module: ${file.path} !`)
    }

    this._checkModule(graphqlModule, file)

    // Inject result in schema object
    if (graphqlModule.typeDefs !== undefined && Array.isArray(graphqlModule.typeDefs)) schmaDef.typeDefs.push(...graphqlModule.typeDefs)
    if (graphqlModule.typeDefs !== undefined && !Array.isArray(graphqlModule.typeDefs)) schmaDef.typeDefs.push(graphqlModule.typeDefs)
    if (graphqlModule.resolvers !== null) merge(schmaDef.resolvers, graphqlModule.resolvers)
    if (graphqlModule.schemaDirectives !== undefined) merge(schmaDef.schemaDirectives, graphqlModule.schemaDirectives)
  }

  /**
   * Check module structure
   *
   * @param {object} moduleDef Module object
   * @param {object} file      Module file object
   * @private
   */
  _checkModule (moduleDef, file) {
    // if (!moduleDef.name) throw new Error('@midgar/graphql-server: Graphql module have no name in file ' + file.path)
    // if (typeof moduleDef.name !== 'string') throw new TypeError('@midgar/graphql-server: Graphql module have invalid name in file ' + file.path)
    if (moduleDef.typeDefs !== undefined && typeof moduleDef.typeDefs !== 'object') throw new TypeError('@midgar/graphql-server: Invalid graphql typeDefs type in file ' + file.path)
    if (moduleDef.schemaDirectives !== undefined && typeof moduleDef.schemaDirectives !== 'object') throw new TypeError('@midgar/graphql-server: Invalid graphql schemaDirectives type in file ' + file.path)
    if (moduleDef.resolvers !== undefined && typeof moduleDef.resolvers !== 'object') throw new TypeError('@midgar/graphql-server: Invalid graphql resolvers type in file ' + file.path)
    if (moduleDef.dependencies !== undefined && !Array.isArray(moduleDef.dependencies)) throw new TypeError('@midgar/graphql-server: Invalid graphql dependencies type in file ' + file.path)
    if (moduleDef.typeDefs === undefined && moduleDef.resolvers === undefined) throw new Error('@midgar/graphql-server: Graphql module have no typeDefs and no resolvers in file ' + file.path)
  }

  /**
   * Get module args
   * @param {object} moduleDef Module object
   * @private
   */
  _getModuleArgs (moduleDef) {
    // Args for the module function
    const args = [
      this.mid
    ]

    // Inject dependencies in the args
    if (moduleDef.dependencies && moduleDef.dependencies.length) {
      for (const dependency of moduleDef.dependencies) {
        args.push(this.mid.getService(dependency))
      }
    }

    return args
  }
}

export default {
  name,
  dependencies,
  service: GraphqlServerService
}

export { GraphqlServerService }
