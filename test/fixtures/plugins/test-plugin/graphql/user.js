import typeDefs from './user.typedefs'
import resolvers from './user.resolvers'

export default {
  dependencies: [
    'test'
  ],
  graphql: (...args) => {
    return {
      typeDefs,
      resolvers: resolvers(...args)
    }
  }
}
