import { WorkhubClient } from "..";

export class ModelStorage {
    private client: WorkhubClient;

    public lastUpdate?: Date;
    
    public types?: {
        crud?: any,
        upload?: any,
        configurable?: any
    } = {}; //Should this be a flat array with a list of directives and a getter?

    constructor(client: WorkhubClient){
        this.client = client;

    }


    getByName(name: string){
        return this.types?.crud?.find((a: any) => a.name == name)
    }

    getByDirective(directive: string){
        return this.types?.crud?.filter((a : any) => a.directives.indexOf(directive) > -1)
    }

    async getTypes() {
        this.lastUpdate = new Date();
        let result = await this.client.query(
            `   query GetTypes ($directives: [String]){
                    types(hasDirective: $directives)
                }
            `,
            {
                directives: ["crud", "upload", "configurable"]
            }
        )

        this.types = { crud: result.data.types[0], upload: result.data.types[1], configurable: result.data.types[2] }
        return this.types;
    }

    map(func: any){
        return this.types?.crud.map(func)
    }
}