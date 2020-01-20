export default (mid, testService) => {
  const users = []
  return {
    Query: {
      getUsers: (parent, args, v, info) => {
        return users
      },
      addUser: async (parent, args, context, info) => {
        const user = {
          id: (users.length + 1),
          email: args.email,
          birthDay: args.birthDay
        }

        users.push(user)
        return user
      },

      getTest: async () => {
        return testService.test()
      }
    }
  }
}
