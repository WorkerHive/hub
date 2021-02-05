import { Client } from "pg";
import { QType } from "./graph2sql";

export class Nectar {
    private definition: QType;

    public tableName: string;

    public fields: Array<string>;

    private serverName: string;
    private serverTable: string;
    private serverFields: string;

    private client: Client;

    constructor(typeDef: string, mapping: any, client: Client) {
        this.definition = new QType(typeDef)
        this.client = client;

        this.serverName = Object.keys(mapping)[0]
        this.serverTable = Object.keys(mapping[this.serverName])[0]
        
        this.fields = Object.keys(mapping[this.serverName][this.serverTable])

        this.serverFields = Object.keys(mapping[this.serverName][this.serverTable]).map((fieldName) => {
            let field = {
                type: this.definition.fields.find((a) => a.name == fieldName)?.type,
                local: fieldName,
                remote: mapping[this.serverName][this.serverTable][fieldName]
            }
            return `"${field.local.toLowerCase()}" ${field.type} options (column_name '${field.remote}')`
        }).join(',\n')

        this.tableName = `nectar_${this.definition.name.toLowerCase()}`

        this.init();
    }

    async init(){
        let dropQ = `
            DROP FOREIGN TABLE IF EXISTS ${this.tableName}
        `

      //  await this.client.query(dropQ);

        let q = `
            CREATE FOREIGN TABLE IF NOT EXISTS ${this.tableName} (
                ${this.serverFields}
            ) server ${this.serverName} options (table_name '${this.serverTable}')
        `        

        await this.client.query(q)
//        console.log(q)
    }
}