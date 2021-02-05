import gql from "graphql-tag";
import { ObjectTypeComposer, SchemaComposer } from "graphql-compose";

export const TypeMap = (type: string) => {

    const map : any = {
        String: 'text',
        Int: 'int',
        Float: 'real',
        Boolean: 'boolean',
        ID: 'text',
        Date: 'date',
        Hash: 'text',
        JSON: 'json'
    }

    let mapped = map[type];
    if(mapped){
        return mapped;
    }else{
        return 'json';
    }
}

export interface QueenType {
    name: string;
    fields: Array<{name: string, type: string, primary: boolean}>;
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