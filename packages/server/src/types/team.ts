export const typeDef = `

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
