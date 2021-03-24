/* 
* Cell : an aggregated set of data
* 
* name: name of the postgres view
* tables: table definitions to aggregate
* 
* Cell reads from pollinator by default, nectar is prioritized when added and will replace fields held by the pollinator
*/

import { Client } from "pg";
import { QType } from "./graph2sql";
import { Nectar } from "./nectar";
import { Pollen } from "./pollen";
import { v4 } from 'uuid';
import { query } from "express";
import { Table } from "./table";
export interface CellContent{
    name: string; //table name
    foreign: boolean; //updatable
    fields: Array<string>; //table fields to collect
}

export class Cell {

    static from : (pollinator: Pollen, nectar: Array<Nectar>) => Cell;

    private typeDef: string;
    private defintion : QType;

    public name: string;

    public cellName: string;

    private client: Client;
    private tables?: Array<CellContent>;


    private fieldMap : any = {};

    private pollinator?: Pollen;
    private nectar_source?: Array<Nectar> = [];

    constructor(typeDef: string, client: Client) {
        //Construct guiding definition from graphql type spec
        this.typeDef = typeDef;
        this.defintion = new QType(typeDef)

        this.name = this.defintion.name.toLowerCase();

        this.cellName = `cell_${this.name}`

        this.client = client;
    }

    static async fromTable(table: Table, client: Client){

    }

    static async create(typeDef: string, client: Client){
        const cell = new Cell(typeDef, client);
        await cell.createPollinator();
        await cell.createCell();
        return cell;
    }
    
    async createPollinator(){
        this.pollinator = await Pollen.create(this.typeDef,this.client)
        this.normalizeSources();
    }

    addPollinator(pollen: Pollen){
        this.pollinator = pollen;
        this.normalizeSources();
    }

    addSource(nectar: Nectar){
        this.nectar_source?.push(nectar)
        this.normalizeSources();
    }

    newSource(mapping: object){
        let nectar = new Nectar(this.typeDef, mapping, this.client)
        this.addSource(nectar);
    }

    normalizeSources(){
        this.fieldMap = {};
        if(this.nectar_source!.length > 0){
            this.nectar_source!.forEach(nectar => {
                nectar.fields.forEach(field => {
                    this.fieldMap[field] = nectar.tableName
                })
            })
        }

        if(this.pollinator){
            this.pollinator.fields.forEach(field => {
                if(!this.fieldMap[field.name]) this.fieldMap[field.name] = this.pollinator?.tableName;
            })
        }

    }

    async getContents(where?: any){
        let valid_query = true;

        let query_vars;
        let query = `
            SELECT * FROM ${this.cellName} `
        if(where) {
            query += ' WHERE';
            query_vars = []

            let query_ix = 0;
            Object.keys(where).forEach((key, ix) => {
                const EOL = ix < Object.keys(where).length - 1 ? ' AND ': ''

                if(where[key] && where[key]['$in']){
                    if(where[key]['$in'].length < 1){
                        valid_query = false;
                    }
                    query += ` "${key}" IN (${where[key]['$in'].map((x: any) => `'${x}'`).join(', ')}) ${EOL}`
                }else{
                    query_ix++;
                    query += ` "${key}"=$${query_ix}::${this.defintion.fields.find((a) => a.name == key)?.type} ${EOL}`
                    query_vars.push(where[key])
                }
            })
        } 

        console.log(valid_query, query, query_vars);

        if(valid_query){
            const result = await this.client.query({
                text: query,
                values: query_vars
            })
            return result.rows;
        }else{
            return [];
        }
        
    }
    

    async addContents(object: any){
        //Add new row to pollinator and join with nectar if needed.
        const idField = this.defintion.fields.find((a) => a.graphType == 'ID')
        if(idField && !object[idField.name]){
        // TODO Remove?    object[idField.name] = v4();
        }
        return await this.updateContents(object, {})
    }

    async deleteContents(where?: any){
        let values : any[] = [];

        let query = `
            DELETE FROM ${this.cellName}`

        if(where && Object.keys(where).length > 0){
            query += " WHERE "
            Object.keys(where).forEach((key, ix) => {
                const EOL = ix < Object.keys(where).length - 1 ? ' AND ': ''

                values.push(where[key])

                query += `${key}=$${ix + 1}::${this.defintion.fields.find((a) => a.name == key)?.type} ${EOL}`
            })
        }
        console.log(query)

        await this.client.query({text: query, values: values})
      /*  await Promise.all(Object.keys(update).map(async (update_field) => {
            if(this.fieldMap[update_field].indexOf('nectar_') < 0){
                updateTables[this.fieldMap[update_field]] = {
                    ...updateTables[this.fieldMap[update_field]],
                    [update_field]: update[update_field]
                } 
            }
        }))*/
        return true;
    }

    async updateContents(update: any, where?: any){

        let updateTables : any = {};

        await Promise.all(Object.keys(update).map(async (update_field) => {
            if(this.fieldMap[update_field].indexOf('nectar_') < 0){
                updateTables[this.fieldMap[update_field]] = {
                    ...updateTables[this.fieldMap[update_field]],
                    [update_field]: update[update_field]
                } 
            }
        }))


        return await Promise.all(Object.keys(updateTables).map(async (table) => {  

            let insertFields = Object.keys(updateTables[table]).map((x) => `${x.toLowerCase()}`);
            let insertValues = Object.keys(updateTables[table]).map((x) => {
                if(this.defintion.fields.find((a) => a.name == x.toLowerCase())?.type == "json"){
                    return JSON.stringify(updateTables[table][x])
                }else{
                    return updateTables[table][x]
                }
            });

            const updateFields = insertFields.map((x, ix) => `"${x}"=$${ix+1}::${this.defintion.fields.find((a) => a.name == x)?.type}`).join(', ')

            let conflictStatement = `(id)`

            if(where){
                insertFields = insertFields.concat(Object.keys(where))
                insertValues = insertValues.concat(Object.keys(where).map((x) => where[x]))
             //   conflictStatement = `(${Object.keys(where).join(', ')})`
            }

            let query = `
                INSERT INTO ${table} 
                (${insertFields.map((x) => `"${x}"`).join(', ')}) VALUES (${insertValues.map((x, ix) => `$${ix + 1}::${this.defintion.fields.find((a) => a.name == insertFields[ix])!.type}`).join(', ')})
                ON CONFLICT ${conflictStatement} DO      
                UPDATE SET ${updateFields}
                RETURNING ${this.defintion.fields.map((x) => `"${x.name}"`).join(', ')}`

            console.log("Update query")

            const update_result = await this.client.query({text: query, values: insertValues})
            return (await this.getContents({id: update_result.rows[0].id}))[0] //TODO replace with a one pass query
//            return update_result.rows[0];
        }))
    }

    async createCell(){

        let query = `CREATE OR REPLACE VIEW ${this.cellName} AS `

        let selectQuery = `SELECT `;


        let fields: any = [];
        Object.keys(this.fieldMap).forEach((field) => {
            fields.push(`${this.fieldMap[field]}.${field}`)
        })

        selectQuery += fields.join(', ')

        selectQuery += ` FROM ${this.pollinator?.tableName}`

        if(this.nectar_source!.length > 0){
            let idField = this.defintion.getID();
            console.log("Creating cell", idField)
            selectQuery += ` RIGHT OUTER JOIN ${this.nectar_source![0].tableName} ON ${this.nectar_source![0].tableName}.${idField?.name}=${this.pollinator!.tableName}.${idField?.name}`
        }

        query += selectQuery
                
        let dropQuery = `DROP VIEW IF EXISTS ${this.cellName}`;
        await this.client.query(dropQuery)

        let result = await this.client.query(query)
    }
}

Cell.from = (pollinator: Pollen, nectar_soures: Array<Nectar> = []) => {
    const cell = new Cell(pollinator.typeDef, pollinator.client)
    cell.addPollinator(pollinator)

    if(nectar_soures.length > 0){
        nectar_soures.forEach((source) => {
            cell.addSource(source)
        })
    }

    cell.createCell();

    return cell;
}