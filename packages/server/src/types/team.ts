import { GraphContext } from "@workerhive/graph";
import jwt from 'jsonwebtoken'

export const typeDef = `
  extend type Mutation {
    inviteMember(id: ID): Boolean
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
    inviteMember: async (parent, {id}, context: GraphContext) => {
      let user: any = await context.connector.read('TeamMember', {id: id})
      if(user.email){
        const token = jwt.sign({
          id: user.id,
          inviter: context.user.id
        }, 'test-secret')

        context.mail.sendMail({
          from: `"WorkHive" <noreply@workhub.services>`,
          to: user.email,
          subject: "Invite to WorkHive",
          text: `
            Kia Ora ${user.name},

            You've been invited to join a WorkHive organisation, click the link below to set up your account.

            ${process.env.WORKHUB_DOMAIN}/signup?token=${token}

            Nga Mihi,
            WorkHive
          `
        })
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
