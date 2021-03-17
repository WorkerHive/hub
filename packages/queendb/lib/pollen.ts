import { Client } from "pg";
import { QType } from "./graph2sql";

export class Pollen {

    public typeDef: string;

    private definition : QType;

    public name: string;
    public tableName: string;

    public fields: Array<{ name: string, primary?: boolean, type: string}>

    public client: Client;

    constructor(typeDef: string, client: Client){ //name: string, fields: Array<{type: string, primary?: boolean, name: string}>, client: Client) {
        this.typeDef = typeDef;

        this.definition = new QType(typeDef); 

        this.name = this.definition.name.toLowerCase(); 
        this.tableName = `pollen_${this.name}`

        this.fields = this.definition.fields

        this.client = client;
    }

    static async create(typeDef: string, client: Client){
        const pollen = new Pollen(typeDef, client);
        await pollen.init();
        return pollen;
    }

    async applyDiff(diff : {[key: string]: {action: string, type: string}}){
        Object.keys(diff).forEach(async (diffKey) => {
            let change = diff[diffKey]
            switch(change.action){
                case 'create':
                    console.log("Add column", diffKey, change.type)
                    await this.addColumn(diffKey, change.type)
                    break;
                case 'update':
                    console.log("Update column", diffKey, change.type)
                    await this.updateColumn(diffKey, change.type)
                    break;
                case 'delete':
                    console.log("Delete column", diffKey)
                    await this.removeColumn(diffKey)
                    break;
                default:
                    break;
            }
        })
    }

    async init(){
        let q = `
            CREATE TABLE IF NOT EXISTS ${this.tableName} (
                ${this.fields.map((x) => `"${x.name.toLowerCase()}" ${x.type} ${x.primary ? 'PRIMARY KEY' : ''}`).join(',\n')}
            )
        `

        await this.client.query(q);
    }

    async addColumn(name: string, type: string){
        let q = `
            ALTER TABLE ${this.tableName} ADD COLUMN IF NOT EXISTS "${name.toLowerCase()}" ${type} 
        `

        await this.client.query(q)
        this.fields.push({
            name: name.toLowerCase(),
            type,
            primary: false
        })
    }

    async updateColumn(name: string, type: string){
        let q = `
            ALTER TABLE ${this.tableName} ALTER COLUMN "${name.toLowerCase()}" SET DATA TYPE ${type} USING "${name.toLowerCase()}"::${type}
        `

        await this.client.query(q)
        let ix = this.fields.map((x) => x.name.toLowerCase()).indexOf(name.toLowerCase())
        if(ix > -1){
            this.fields[ix].type = type;
        }
    }

    async removeColumn(name: string){
        let q = `
            ALTER TABLE ${this.tableName} DROP COLUMN "${name.toLowerCase()}"
        `

        await this.client.query(q)
        let ix = this.fields.map((x) => x.name.toLowerCase()).indexOf(name.toLowerCase())
        if(ix > -1){
            this.fields.splice(ix, 1);
        }
    }

}