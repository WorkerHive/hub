import BaseAdapter from "../base-adapter"
import { mapBack, getFields, mapForward, mapQuery, objectFlip } from '../../utils/flow-query'
import sql from 'mssql';
import { camelCase } from "camel-case"

export default class MSSQLAdapter extends BaseAdapter{

    getType(type){
       
        switch(type){
            case 'String':
                return sql.NVarChar;
            case 'Int':
                return sql.Int;
            case 'Float':
                return sql.Float;
            case 'Boolean':
                return sql.Bit;
            default:
                console.log("No type found for", type)
                return null;
        }
    }

    async request(inputs, query){
        let request = new sql.Request();
        for(var k in inputs){
            request.input(k, inputs[k].type, inputs[k].value)
        }
        let result = await request.query(query);
      
        return result.recordset;
    }

    deleteProvider(bucket, typeDef, provides){
        return async (id) => {
            let request = new sql.Request();

            request.input('id', sql.VarChar, id)
            let idKey = "ID"

            let sqlQuery = `DELETE FROM ${bucket.name} WHERE ${idKey}=@id`
        }
    }
    
    addProvider(bucket, typeDef, provides){
        let { fields, empty } = getFields(provides)
        let flippedProvider = objectFlip(provides)

        return async (newObject) => {
            let query = mapForward(provides, newObject)

            let request = new sql.Request();
            let insertKeys = [];
            let valueKeys = [];
    
            fields.forEach((value, index) => {
            
                let vKey = camelCase(value)
                let qKey = typeDef.astNode.fields.filter((a) => a.name.value == flippedProvider[value])[0]
                
           
                request.input(vKey, this.getType(qKey.type.name.value), query[value])
                insertKeys.push(value)
                valueKeys.push(vKey)
            })
    
            let sqlQuery = `INSERT INTO ${bucket.name} (${insertKeys.join(', ')}) VALUES (${valueKeys.map((x) => "@"+x).join(', ')})`
            
            
            //request.query(sql)
        }
    }

    updateProvider(bucket, typeDef, provides){
        let { fields, empty } = getFields(provides);
        const flippedProvider = objectFlip(provides)
        
        return async (id, update) => {
            let query = mapQuery(provides, update)

            let request = new sql.Request();

            let valuePairs = [];

            for(var k in query){
                let vKey = camelCase(k)
                let qKey = typeDef.astNode.fields.filter((a) => a.name.value == flippedProvider[k])[0]
                
                request.input(vKey, this.getType(qKey.type.name.value), query[k])
                valuePairs.push(`${k}=@${vKey}`)
            }
            
            let idKey = "ID"; //TODO find cross iD links

            let sqlQuery = `UPDATE ${bucket.name} SET ${valuePairs.join(', ')} WHERE ${idKey}=@id`
        }
    }

    getProvider(bucket, typeDef, provides){
        let {fields, empty} = getFields(provides)

        return async (query) => {
            let request = new sql.Request();
            let whereClause = '';
            for(var k in query){
                request.input(k, sql.VarChar, query[k])
                whereClause += `${k}=@${k}`
            }
            let sqlQuery = `SELECT ${fields.join(', ')} FROM ${bucket.name} WHERE ${whereClause}`;
        
            let result = await request.query(sqlQuery)
        
        }
    }

    getAllProvider(bucket, typeDef, provides){
  
        let { fields, empty } = getFields(objectFlip(provides))

        let query = `SELECT ${fields.join(', ')} FROM ${bucket.name}`

     
        return async () => {
            let result = await this.request({}, query);

    
            return result.map((item) => mapBack(objectFlip(provides), item))
        }
    }
}
