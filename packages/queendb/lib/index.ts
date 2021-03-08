import { Client } from 'pg';
import { Cell } from './cell';
import { CREATE_SERVER, CREATE_USER, IMPORT_SERVER } from './fdw/mssql';
import { Nectar } from './nectar';
import async from 'async';
import { Pollen } from './pollen';

export interface QueenConfig {
    user?: string;
    password?: string;
    host?: string;
    database?: string;
    port?: number;
    ssl?: any;
}

export {
    Cell,
    Nectar,
    Pollen
};

export default class QueenDb {
    // TODO

    public client: Client;

    private cells: Array<Cell | undefined> = [];

    constructor(config: QueenConfig){
        this.client = new Client(config);
        this.startClient()
    }

    async startClient(){
        await this.client.connect();
        await this.client.query(`SET DATESTYLE to 'ISO, DMY';`)
    }

    async stopClient(){
        await this.client.end();
    }

    async createTable(name: string, fields: Array<any>){
        let fieldMap = fields.map((x) => {
            return `${x.key} ${x.type}`
        }).join(',\n')
        let query = `create table ${name} (
            ${fieldMap}
        )`
        let result = await this.client.query(query)
        console.log(result)
    }

    
    async createViewUpdater(view_name: string, tables: Array<any>, update_name?: string){
        let functionName = `${update_name || view_name}_mod`;
        let triggerName = `${functionName}_trigger`

        let inserts = tables.map((x) => {
            return `INSERT INTO ${x.name} VALUES (${x.fields.map((field: any) => `NEW.${field.name}`).join(', ')});`
        }).join(`\n`)

        let updates = tables.map((x) => {
            return `UPDATE ${x.name} SET ${x.fields.filter((a: any) => !a.fresh).map((field: any) => `${field.name}=NEW.${field.name}`).join(', ')} WHERE ${x.where.map((y: any) => `${y.name}=OLD.${y.name}`)};`
        }).join(`\n`)

        let deletes = tables.map((x) => {
            return `DELETE FROM ${x.name} WHERE ${x.where.map((y: any) => `${y.name}=OLD.${y.name};`)}`
        }).join(`\n`)

        let functionQuery = `
            CREATE OR REPLACE FUNCTION ${functionName}()
            RETURNS TRIGGER
            LANGUAGE plpgsql
            AS $function$
                BEGIN
                    IF TG_OP = 'INSERT' THEN
                        ${inserts}
                        RETURN NEW;
                    ELSIF TG_OP = 'UPDATE' THEN
                        ${updates}
                        RETURN NEW;
                    ELSIF TG_OP = 'DELETE' THEN
                        ${deletes} 
                        RETURN NULL;
                    END IF;
                    RETURN NEW;
                END;
            $function$;
        `

        let triggerQuery = `
            CREATE TRIGGER ${triggerName}
                INSTEAD OF INSERT OR UPDATE OR DELETE ON ${view_name} FOR EACH ROW EXECUTE PROCEDURE ${functionName}();
        `

        await this.client.query(functionQuery)
        const result = await this.client.query(triggerQuery)

        console.log(result)
    }

    async createForeignTable(name : string, fields: Array<any>, server : string, options: string){
        let fieldMap = fields.map((x) => {
            return `${x.key} ${x.type}`
        }).join(',\n')
        let query = `create foreign table ${name} (
            ${fieldMap}
        ) server ${server} options (${options});`
        let result = await this.client.query(query)

        console.log(result)
    }

    async setupTypeStore(types: Array<string>){
        const cells = await Promise.all(types.map(async (item) => {
            const cell = new Cell(item, this.client);
            await cell.createPollinator();
            await cell.createCell();
            return cell;
        }))
        this.cells = [...new Set(this.cells.concat(cells))]
    }

    async rehydrate(map: {nodes?: Array<{id: string, type: string, data: any}>, links: Array<{id: string, source: string, target: string}>}){
        const adapters = map.nodes?.filter((a) => a.type === 'extAdapter').map((x) => {
            let source = map.links.find((a) => a.source == x.id)?.target;
            let target = map.links.find((a) => a.target == x.id)?.source;

            if(source!.indexOf('store-') > -1 && target!.indexOf('type-') > -1){
                //Direct adapter                
                source = source?.replace('store-', '')
                target = target?.replace('type-', '')
            }
            return {node: x.data, source, target}
        })

        adapters?.forEach((adapter) => {
            let mapping : any = {
                [adapter.source!]: {
                    [adapter.node.collection]: {

                    }
                } 
            };
            if(adapter.node.type_map){
                Object.keys(adapter.node.type_map).forEach((key) => {
                    if(adapter.node.type_map[key] && (adapter.node.type_map[key].length > 0 || adapter.node.type_map[key].sql != null) && adapter.node.type_map[key] !== 'n/a'){
                        mapping[adapter.source!][adapter.node.collection][key] = adapter.node.type_map[key].sql != null ? adapter.node.type_map[key].sql : `"${adapter.node.type_map[key]}"`
                    }
                })

                console.log("Adapter mappings", mapping)

                this.getCell(adapter.target!)?.newSource(mapping);
                this.getCell(adapter.target!)?.createCell();
            }
        })
    }

    async getServers(){
        let query = `
        select 
            srvname as name, 
            srvowner::regrole as owner, 
            fdwname as wrapper, 
            srvoptions as options
        from pg_foreign_server
        join pg_foreign_data_wrapper w on w.oid = srvfdw;
        `
        let results = await this.client.query(query);
        return results.rows;
    }

    async newCell(typeDef: string){
        const cell = await Cell.create(typeDef, this.client);
        this.cells.push(cell);
        return cell;
    }

    getCell(cell_name: string){
        return this.cells.find((a) => a!.name == cell_name.toLowerCase());
    }

    async addCellRow(cell_name: string, data: object){
        const cell = this.getCell(cell_name);
        const result = await cell?.addContents(data);
 
        return result && result.length > 0 ? result[0] : {};
    }

    async updateCell(cell_name: string, query: any, update: any){
        const cell = this.getCell(cell_name);
        const result = await cell?.updateContents(update, query);
        return result && result.length > 0 ? result[0] : {};
    }

    async readAllCell(cell_name: string, query: any){
        const cell = this.getCell(cell_name);
        const results = await cell?.getContents(Object.keys(query).length > 0 ? query: null);
        return results 
    }

    async readCell(cell_name: string, query: any){
        const cell = this.getCell(cell_name);
        const result = await cell?.getContents(query);
        return result && result.length > 0 ? result[0] : {};
    }


    async getServerTables(name: string){
        let query = `
            SELECT foreign_table_name AS name FROM information_schema.foreign_tables WHERE foreign_table_schema = $1::text
        `
        return (await this.client.query(query, [name])).rows;
    }

    async getTableColumns(schema_name: string, table_name: string){
        let query = `
            SELECT column_name AS name, data_type AS datatype FROM information_schema.columns WHERE table_schema = $1::text AND table_name = $2::text
        `
        return (await this.client.query(query, [schema_name, table_name])).rows;
    }

    //MSSQL only atm
    async linkServer(name:string, server: {host: string, port: number, database: string}){
        let query = CREATE_SERVER(name, server)
        await this.client.query(query)
    }

    async importServer(name: string){
        let query = IMPORT_SERVER(name)
        await this.client.query(query)
    }

    async linkUser(local_user: string, server: string, remote_user: {name: string, pass: string}){
        let query = CREATE_USER(local_user, server, remote_user.name, remote_user.pass)
        await this.client.query(query)
    }

}
