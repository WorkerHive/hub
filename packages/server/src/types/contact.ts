export const typeDef = `

    type Contact @crud @configurable{
        uuid: String @uuid
        id: ID
        name: String @input
        phone_number: String @input
        email: String @input
        notes: Description @input
        company: [ContactOrganisation] @input(ref: true)
    }

    type ContactOrganisation @crud @configurable{
        id: ID
        name: String @input
        location: String @input
        contacts: [Contact] @input
    }


`