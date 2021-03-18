
export const typeDef = `
type Schedule @crud @configurable{
  id: ID
  all_day: Boolean @input
  project: Project @input(ref: true)
  start: Date @input
  end: Date @input
  people: [TeamMember] @input(ref: true, required: false)
  resources: [Equipment] @input(ref: true, required: false)
}

`

