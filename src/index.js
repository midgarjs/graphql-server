import { Plugin } from '@midgar/midgar'

export const MODULE_TYPE_KEY = 'midgar-graphql'
/**
 * GraphqlServerPlugin class
 */
class GraphqlServerPlugin extends Plugin {
  constructor (...args) {
    super(...args)

    /**
     * Graphql module type key
     * @type {string}
     */
    this.moduleTypeKey = MODULE_TYPE_KEY
  }

  /**
   * Init plugin
   */
  async init () {
    // Add graphql module type
    this.pm.addModuleType(MODULE_TYPE_KEY, 'graphql', '**/*.js', ['**/*.typedefs.js', '**/*.resolvers.js'])

    // Listen @midgar/express:afterInit event
    this.mid.on('@midgar/express:afterInit', () => this.mid.getService('mid:graphqlServer').start())
  }
}

export default GraphqlServerPlugin
