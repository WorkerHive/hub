import { GraphQLObjectType } from "graphql-compose/lib/graphql";
const { ObjectId } = require("mongodb");
const {  objectFlip, mapForward, mapBack, mapQuery } = require("../../utils/flow-query");
const BaseAdapter = require("../base-adapter");

export default class MongoAdapter extends BaseAdapter{

    constructor(db){
        super();
        this.client = db;
    }

    getProvider(bucket : any, typeDef : GraphQLObjectType, provides : any){
        return async (search) => {
        

            let query = mapQuery(objectFlip(provides), search)
            let result = await this.client.collection(`${bucket.name}`).findOne(query)
            return mapForward(typeDef, provides, result)
        }
    }

    getAllProvider(bucket, typeDef : GraphQLObjectType, provides){
        return async (search) => {
            let query = mapQuery(objectFlip(provides), search)
            let results = await this.client.collection(`${bucket.name}`).find(query).toArray()
            return results.map((x) => mapForward(typeDef, provides, x));
        }
    }

    updateProvider(bucket, typeDef : GraphQLObjectType, provides){
        return async(query, obj) => {
             let q = mapQuery(objectFlip(Object.assign({}, provides)), query)
            let inputObject = mapBack(provides, obj)
           
         
            for(var key in inputObject){
                if(!inputObject[key]){
                    delete inputObject[key]
                }
            }
            if(Object.keys(inputObject).length > 0) {
                let result = await this.client.collection(`${bucket.name}`).findOneAndUpdate(q, {$set: inputObject}, {upsert: true, new: true, returnOriginal: false})
                if(result.value){
                    return mapForward(typeDef, provides, result.value);
                }
            }else{
                let res = await this.client.collection(`${bucket.name}`).findOne(q)
                return mapForward(typeDef, provides, res);
            }
        }
    }

    deleteProvider(bucket, typeDef : GraphQLObjectType, provides){
        return async(query) => {
   
            let q = mapQuery(objectFlip(Object.assign({}, provides)), query)
            
            return await this.client.collection(`${bucket.name}`).deleteOne(q)
        }
    }

    addProvider(bucket, typeDef : GraphQLObjectType, provides){
        return async(newObject) => {
            let  obj = mapBack(provides, newObject)
           
            let newObj = await this.client.collection(`${bucket.name}`).insertOne(obj)
            return mapForward(typeDef, provides, newObj.ops[0])
        }
    }
}
