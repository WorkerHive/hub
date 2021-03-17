export const initialTypes = (initialTypes: string) => `
type Query {
    empty: String
}

type Mutation {
    empty: String
}

type Subscription {
    empty: String
}
${initialTypes}

`