import { GraphContext } from "@workerhive/graph";

export const typeDef = `
  extend type Mutation {
    changePassword(current: Hash, next: Hash): Boolean
  }

  type TeamMember @crud @configurable {
    "A member of your WorkHub Team"
    id: ID
    username: String @input
    password: Hash @input 
    status: String @input
    admin: Boolean @input
    name: String @input
    email: String @input
    phone_number: String @input
  }

`

export const resolvers =  {
  Mutation: {
    changePassword: async (parent, {current, next}, context : GraphContext) => {
      console.log("Change password", current, next);
    }
  }
}
