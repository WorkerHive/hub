import { makeExecutableSchema } from "@graphql-tools/schema";
import { SchemaComposer, schemaComposer } from "graphql-compose";
import { v4 } from 'uuid'
export default class RoleRegistry {
    private roles : Array<Role> = [];

    public composer: SchemaComposer<any> = schemaComposer.clone();
    
    constructor(){
        this.setupMutable();
    }

    get sdl() {
        let sdl = ``;
        this.composer.types.forEach((type, key) => {
            if(typeof(key) == 'string'){
                sdl += `\n` + type.toSDL();
            }
        })   
        return sdl; 
    }

    get schema(){
        let outputSchema = this.composer.clone();
       // outputSchema.addResolveMethods(this.resolvers)

        return outputSchema.buildSchema();
       // return makeExecutableSchema({typeDefs:this.sdl, resolvers: this.resolvers});
    }

    get resolvers(){
        return this.composer.getResolveMethods();
    }

    setupMutable(){
        this.composer.createObjectTC({
            name: 'Role',
            fields: {
                id: 'ID',
                name: 'String',
                permissions: 'JSON'
            }
        })

        this.composer.Query.addFields({
            'roles': {
                type: '[Role]',
                resolve: (parent, args, context) => {
                    return this.roles;
                }
            },
            'role': {
                type: 'Role',
                args: {
                    name: 'String'
                },
                resolve: (parent, args, context) => {
                    return this.roles[args.name];
                }
            }
        })

        this.composer.Mutation.addFields({
            addRole: {
                type: 'Role',
                args: {
                    name: 'String',
                    permissions: 'JSON'
                },
                resolve: (parent, args, context) => {
                    let role = {
                        id: v4(),
                        name: args.name, 
                        permissions: args.permissions
                    }
                    this.roles.push(role)
                    return role
                }
            },
            updateRole: {
                type: "Role",
                args: {
                    id: "String",
                    name: "String",
                    permissions:"JSON"
                },
                resolve: (parent, args, context) => {
                  let ix = this.roles.map((x: any) => x.id).indexOf(args.id)
                  this.roles[ix] = {
                    ...this.roles[ix],
                    permissions: args.permissions
                  }
                  return this.roles[ix];
                }
            },
            deleteRole: {
                type: "Boolean",
                args: {
                    id: "String"
                },
                resolve: (parent, args, context) => {
                  let ix = this.roles.map((x: any) => x.id).indexOf(args.id)
                  if(ix > -1){
                    this.roles.splice(ix, 1);
                  }
                  return true;
                }
            }
        })
    }
}

interface Role {
    id: string;
    name: string;
    permissions: Record<any, any>;
}
