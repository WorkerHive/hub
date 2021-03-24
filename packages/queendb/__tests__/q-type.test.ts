import { QType } from '../lib/graph2sql'

let type = new QType(`
    type Project {
        _id: ID
        id: Int @id
    }
`)

console.log(type.getID())
console.log(type.fields.map((x) => x.graphDirectives))
//console.log(type)