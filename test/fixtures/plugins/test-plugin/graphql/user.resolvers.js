export default (mid) => {
  const users = []
  return {
    Query: {
      getUsers: (parent, args, v, info) => {
        return users
      },
      addUser: async (parent, args, context, info) => {
        const user = {
          id: (users.length + 1),
          email: args.email
        }
        users.push(user)
        return user
      }
    }
  }
}
