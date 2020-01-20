import typeDefs from './user.typedefs'
import resolvers from './user.resolvers'

export default {
  graphql: (...args) => {
    return {
      typeDefs,
      resolvers: resolvers(...args)
    }
  }
}
