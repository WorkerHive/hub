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
            console.log(field.local.toLowerCase(), field.type);
            return `cast(${field.remote} as ${field.type}) as "${field.local.toLowerCase()}"`
          //  return `"${field.local.toLowerCase()}" ${field.type} options (column_name '${field.remote}')`
        }).join(',\n')

        console.log("Nectar setup ", this.serverFields);

        this.tableName = `nectar_${this.definition.name.toLowerCase()}`

        this.init();
    }

    async init(){
        let dropQ = `
            DROP FOREIGN TABLE IF EXISTS ${this.tableName}
        `

      //  await this.client.query(dropQ);

        let q = `
            CREATE OR REPLACE VIEW public.${this.tableName}
            AS SELECT 
                ${this.serverFields}
            FROM "${this.serverName}"."${this.serverTable}"
        `        
        console.log("Nectar replacement", q)
        await this.client.query(q)
//        console.log(q)
    }
}