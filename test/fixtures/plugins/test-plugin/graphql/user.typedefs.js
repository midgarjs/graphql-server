const { gql } = require('apollo-server-express')

export default gql`
  type User {
    id: ID!
    email: String!
  }

  extend type Query {
    addUser(email: String): User
    getUsers: [User]
  }
`
