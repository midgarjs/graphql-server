import { gql } from 'apollo-server-express'
import { GraphQLScalarType, Kind } from 'graphql'

const typeDefs = gql`
  scalar Date
`
const Date = new GraphQLScalarType({
  name: 'date',
  description: 'A DateTime representation in ISO format',
  parseValue (value) {
    return new Date(value) // value from the client
  },
  serialize (value) {
    return value.getTime() // value sent to the client
  },
  parseLiteral (ast) {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value) // ast value is always in string format
    }
    return null
  }
})

export default {
  graphql: {
    typeDefs,
    resolvers: {
      Date
    }
  }
}
