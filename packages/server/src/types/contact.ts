export const typeDef = `

    type Contact @crud @configurable{
        id: ID
        name: String @input
        phone_number: [String] @input
        email: [String] @input
        notes: [String] @input
        history: [ContactOrganisation] @input
    }

    type ContactOrganisation @crud @configurable{
        id: ID
        name: String @input
        location: String @input
        contacts: [Contact] @input
    }

`