import { schemaComposer } from 'graphql-compose';
import { applyMiddleware } from 'graphql-middleware'

import { applyGenerators, uuidMiddleware } from '../src/graph/middleware/uuid'
import { directive, transform } from '../src/graph/directives/uuid'

import { execute, parse, Source } from 'graphql';
import { v4 } from 'uuid';

schemaComposer.addTypeDefs(`
    type Query {
        empty: String
    }

    type Test {
        id: ID @uuid
        name: String
        ts: Float @ts
    }

    input TestInput {
        id: ID @uuid
        name: String
        ts: Float @ts
    }
`)


schemaComposer.Mutation.addFields({
    addTest: {
        type: 'Test',
        args: {
            input: 'TestInput'
        },
        resolve: applyGenerators(async (parent, args, context, info) => {
            return args
        }, {
            uuid: (type, field) => v4(),
            ts: (type, field) => new Date().getTime()
        })
    }
})

schemaComposer.addDirective(directive)

const schema = schemaComposer.buildSchema()

const query = `
    mutation { 
        addTest{
            id
            ts
            name
        }
    }
`;

(async () => {
const result = await execute(
    {
        schema: schema,
        document: parse(new Source(query)),
        rootValue: {}
    }
)
console.log(result);

})()

