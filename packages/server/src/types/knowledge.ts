
export const typeDef = `
  type Knowledge @crud @configurable {
    "A series of work"
    id: Int @id
    title: String @input
    description: String @input
    content: String @input
    parent: String @input
    links: [String]
  }
  `
