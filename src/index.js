import { Plugin } from '@midgar/midgar'

export const DIR_KEY = 'midgar-graphql'
/**
 * GraphqlServerPlugin class
 */
class GraphqlServerPlugin extends Plugin {
  constructor (...args) {
    super(...args)

    /**
     * Graphql dir key
     * @type {String}
     */
    this.dirKey = DIR_KEY
  }

  /**
   * Init plugin
   */
  async init () {
    // Add graphql plugin dir
    this.pm.addPluginDir(DIR_KEY, 'graphql')

    // Listen @midgar/express:afterInit event
    this.mid.on('@midgar/express:afterInit', () => this.mid.getService('mid:graphqlServer').start())
  }
}

export default GraphqlServerPlugin
