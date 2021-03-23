import gql from "graphql-tag";
import { ObjectTypeComposer, SchemaComposer } from "graphql-compose";
import { invert } from "lodash";
import { Table } from "./table";

const schemaComposer = new SchemaComposer();
    const type_map : any = {
        String: 'text',
        Int: 'int',
        Float: 'real',
        Boolean: 'boolean',
        ID: 'integer',
        Date: 'date',
        Hash: 'text',
        Description: 'text',
        Moniker: 'text',
        JSON: 'json'
    }

    const inv_type_map : any = {
        'character varying': 'String',
        'text': 'String',
        'real': 'Float',
        'json': 'JSON',
        'date': 'Date',
        'integer': 'Int',
        'int': 'Int',
        'bool': 'Boolean'
    }

export const TypeMap = (type: string) => {



    let mapped = type_map[type];
    if(mapped){
        return mapped;
    }else{
        return 'json';
    }
}

export const InvType = (type: string) => {
    return inv_type_map[type]
}

export interface QueenType {
    name: string;
    fields: Array<{name: string, type: string, primary: boolean}>;
}

const graphToSQL = (definition: string) => {
    const _graphDef = schemaComposer.createTempTC(definition) as ObjectTypeComposer;//.createTempObjectTC(defintion);
    const fields = _graphDef.getFields();

    const graphDef = gql`${definition}`;

    let def = (graphDef.definitions[0] as any)

    return {
        name: def.name.value,
        fields: Object.keys(fields).map((x: any) => ({
            name: x, 
            graphType: fields[x].type.getTypeName(), 
            type: TypeMap(fields[x].type.getTypeName()),
            primary: fields[x].type.getTypeName() === 'ID'
        }))
    }
}

const sqlToGraph = (table: Table) => {
    let tbl = {
        name: table.table_name.split('_')[1],
        fields: table.columns.map((x) => ({
            name: x.column_name,
            type: InvType(x.data_type),
            primary: x.primary
        }))
    }

    return `
        type ${tbl.name} {
            ${tbl.fields.map((field) => {
                return `${field.name} : ${field.primary ? 'ID' : field.type}`
            }).join(`\n`)}
        }
    `
}

export {
    graphToSQL,
    sqlToGraph
}

export class QType implements QueenType {

    name: string;
    fields: { name: string; graphType: string; type: string; primary: boolean; }[];
    schemaComposer: SchemaComposer<any> = new SchemaComposer();

    constructor(defintion: string){
        const _graphDef = this.schemaComposer.createTempTC(defintion) as ObjectTypeComposer;//.createTempObjectTC(defintion);
        const fields = _graphDef.getFields();

        const graphDef = gql`${defintion}`;

        let def = (graphDef.definitions[0] as any)

        this.name = def.name.value;

        this.fields = Object.keys(fields).map((x: any) => ({
            name: x, 
            graphType: fields[x].type.getTypeName(), 
            type: TypeMap(fields[x].type.getTypeName()),
            primary: fields[x].type.getTypeName() === 'ID'
        }))
    }

    
}