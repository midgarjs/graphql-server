[![Build Status](https://drone.midgar.io/api/badges/Midgar/graphql-server/status.svg)](https://drone.midgar.io/Midgar/graphql-server)
[![Coverage](https://sonar.midgar.io/api/project_badges/measure?project=Midgar%3Aapollo-server&metric=coverage)](https://sonar.midgar.io/dashboard?id=Midgar%3Aapollo-server)

# @midgar/graphql-server

PLugin [Midgar](https://github.com/midgarjs/midgar) pour ajouter  [graphql serveur](https://www.apollographql.com) avec loader de modules graphql et injéction de services.

## Installation

```sh
$ npm i @midgar/graphql-server --save
```

Si tout s'est bien passé, un message de confirmation s'affiche:
```
#midgar-cli
@midgar/graphql-server added to plugins.js !
```

## Fonctionnement
Ajoute un dossier de plugin **midgar-graphql**: ./graphql/ pour les modules graphl.

## module grapql
Un module graphql est un fichier javacript exportant les typeDefs et les resolvers graphql.

Exemple d'un module graphl:
```js
import { gql } from 'apollo-server-express'

// Type defs graphql
const typeDefs = gql`
  type User {
    id: ID!
    email: String!
  }

  extend type Query {
    addUser(email: String): User
    getUsers: [User]
  }
`

export default {
  // Services à incjecter
  dependencies: ['mid:user']
  graphql: (mid, userService) => {
    return {
      typeDefs,
      resolvers:{
        User: {
        ...
        }
        Query: {
          createUser: async (parent, args, ctx, info) => {
            await userService.create(args.email, args.parssword)
          },
          getUsers: (parent, args, ctx, info) => {
            ...
          },
        }
      }
    }
  }
}
```
Vous pouvez séparrer le fichier si besoin:


```js
import typeDefs from './user.typedefs'
import resolvers from './user.resolvers'

export default {
  dependencies: ['mid:user']
  graphql: (...args) => {
    return {
      typeDefs,
      resolvers: () => resolvers(...args)
    }
  }
}
```

Les fichiers *.typedefs.js et *.resolvers.js ne sont pas importé lors de l'import des modules graphql.
