import { Type } from '../src/registry/type'
import { schemaComposer } from 'graphql-compose';

let otc = schemaComposer.createObjectTC(`
    type Test {
        name: String @input
        other: String @input(ref: true)
        other2: String
    }
`)
let type = new Type(otc)
console.log(type.def.map((x) => x.directives))