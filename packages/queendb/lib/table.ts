
import { Client } from "pg";

export interface Column {
    column_name: string;
    data_type: string;
    primary: boolean;
}

export class Table {
 
    public table_name: string;

    public name: string;

    public columns : Array<{
        column_name: string,
        data_type: string,
        primary: boolean
    }> = [];

    private client: Client;
    
    constructor(tableName: string, columns: Column[], client: Client){
        this.table_name = tableName;
        this.name = tableName.split('_')[1]
        this.columns = columns
        this.client = client;
    }

    static async from(table_name: string, client: Client){
        let columns = await client.query(`
            select column_name, data_type, character_maximum_length, is_identity
            from INFORMATION_SCHEMA.COLUMNS where table_name='${table_name}'`) 

        let keys = await client.query(`
            SELECT kcu.table_name, kcu.column_name as key_column 
            FROM information_schema.table_constraints tco
            JOIN information_schema.key_column_usage kcu 
            ON kcu.constraint_name = tco.constraint_name
            AND kcu.constraint_schema = tco.constraint_schema
            AND kcu.constraint_name = tco.constraint_name
            WHERE tco.constraint_type = 'PRIMARY KEY' AND kcu.table_name = '${table_name}'
            ORDER by kcu.table_schema, kcu.table_name`);

        let cols = columns.rows;
        if(keys.rows.length > 0){
            let ix = columns.rows.map((x) => x.column_name).indexOf(keys.rows[0].key_column)
            cols[ix].primary = true;
        }
        return new Table(table_name, cols, client)
    }

    toGraphQL(){
        return `
            type ${this.table_name} {
                ${this.columns.map((x) => {
                    return `${x.column_name} : ${x.data_type}`
                }).join(`\n`)}
            }
        `
    }

    async init(){
        this.columns = await this.describe();
        let key = await this.primaryKey();
        if(key.length > 0){
            let ix = this.columns.map((x) => x.column_name).indexOf(key[0].key_column)
            this.columns[ix].primary = true;
        }
    }

    async describe(){
        let result = await this.client.query(`
            select column_name, data_type, character_maximum_length, is_identity
            from INFORMATION_SCHEMA.COLUMNS where table_name='${this.table_name}'`) 
        return result.rows;
    }

    async primaryKey(){
        let result = await this.client.query(`
            SELECT kcu.table_name, kcu.column_name as key_column 
            FROM information_schema.table_constraints tco
            JOIN information_schema.key_column_usage kcu 
            ON kcu.constraint_name = tco.constraint_name
            AND kcu.constraint_schema = tco.constraint_schema
            AND kcu.constraint_name = tco.constraint_name
            WHERE tco.constraint_type = 'PRIMARY KEY' AND kcu.table_name = '${this.table_name}'
            ORDER by kcu.table_schema, kcu.table_name`)
        return result.rows
    }
}