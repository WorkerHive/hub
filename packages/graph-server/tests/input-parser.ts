import HiveGraph, { LoggerConnector } from "../src"

let initial = `
    type Test{
        input: String @input(ref: true)
    }
`

let server = new HiveGraph(initial, {}, new LoggerConnector(), false)

console.log(server.typeSDL, server.typeRegistry)