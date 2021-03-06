import { GraphContext } from "../graph";
import jwt from 'jsonwebtoken'

export const typeDef = `
  extend type Mutation {
    inviteMember(id: ID): Boolean
    changePassword(current: Hash, next: Hash): Boolean
  }

  type Role @crud @configurable{
    id: ID @uuid
    name: String @input
    permissions: JSON @input
  }

  type SiteFeedback @crud @configurable {
      id: Int @id
      from: String @input
      subject: String @input
      message: Description @input
   }

  type TeamHub @crud @configurable {
    id: Int @id
    name: String @input
    slug: Moniker @input
    location: String @input
    active: Boolean @input
  }

  type TeamMember @crud @configurable {
    "A member of your WorkHub Team"
    id: Int @id
    username: String @input
    password: Hash 
    roles: [Role] @input(ref: true)
    status: String 
    name: String @input
    email: String @input
    phone_number: String @input
  }

`

export const resolvers =  {
  Mutation: {
    inviteMember: async (parent, {id}, context: GraphContext) => {
      let user: any = await context.connector.read('TeamMember', {id: id})
      if(user.email){
        const token = context.signToken({
          sub: user.id,
          type: 'signup',
          inviter: context.user.id
        })

        await context.mail.inviteUser(user, token);

        return true;
      }else{
        return false;
      }
    },
    changePassword: async (parent, {current, next}, context : GraphContext) => {
      let user : any = await context.connector.read('TeamMember', {id: context.user.id})
      if(user.password == current){
        let result = await context.connector.update('TeamMember', {id: context.user.id}, {password: next})
        console.log("Change password result", result);
        return result != null;
      }else{
        return false;
      }

    }
  }
}
