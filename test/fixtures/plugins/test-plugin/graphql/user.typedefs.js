const { gql } = require('apollo-server-express')

export default gql`
type User {
  id: ID!
  email: String!
  birthDay: Date!
}

extend type Query {
  getTest: String
  addUser(email: String!, birthDay: Date!): User
  getUsers: [User]
}
`
