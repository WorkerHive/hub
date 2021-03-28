import { createHttpLink } from 'apollo-link-http'
import fetch from 'cross-fetch'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { createUploadLink } from 'apollo-upload-client'
import { WorkhubClient } from '.'

const ENVIRONMENT = (typeof process !== 'undefined') && (process.release && process.release.name === 'node') ? 'NODE' : 'BROWSER'
let Apollo, gql: any;
let BoostClient: any;
let ReactClient: any;


const getClient = async () => {
    if (ENVIRONMENT == "NODE") {
        Apollo = await import('apollo-boost');
        BoostClient = Apollo.ApolloClient
        gql = Apollo.gql
    } else {
        Apollo = await import('@apollo/client')
        ReactClient = Apollo.ApolloClient
        gql = Apollo.gql
    }
}
export class Graph{
    private graphClient: any;
    private client: WorkhubClient;
    private hubUrl?: string;

    constructor(client: WorkhubClient){
        this.client = client;
        this.hubUrl = client.hubUrl;
        this.setup()
        console.debug('=> Setup client', this.hubUrl)

    }

    static async from(client: WorkhubClient){
        await getClient();
        return new Graph(client)
    }

    setup(){
        let opts : any = {};
        opts.cache = new InMemoryCache({
            addTypename: false
        })

        if (ENVIRONMENT == "NODE") {
            opts.link = createHttpLink({
                uri: `${this.hubUrl}/graphql`,
                headers: {
                    Authorization: this.client.accessToken ? `Bearer ${this.client.accessToken}` : "",
                }
            })
            this.graphClient = new BoostClient(opts)
            console.log("Setup Boost Graph")
        } else {
            opts.link = createUploadLink({
                uri: `${this.hubUrl}/graphql`,
                headers: {
                    Authorization: this.client.accessToken ? `Bearer ${this.client.accessToken}` : "",
                }
            })

            this.graphClient = new ReactClient(opts)
            console.log("Setup React Graph", this.graphClient)
        }
    }

    async query(query: string, variables: object = {}) {
        console.log("Query", this)
        let result = await this.graphClient!.query({
            query: gql`${query}`,
            variables: variables
        })
        return result;
    }

    async mutation(query: string, variables: object = {}) {
        let result = await this.graphClient!.mutate({
            mutation: gql`${query}`,
            variables: variables
        })
        return result;
    }



}