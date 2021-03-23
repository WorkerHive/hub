import { setContext } from 'apollo-link-context'
import { createHttpLink } from 'apollo-link-http'
import fetch from 'cross-fetch'
import {InMemoryCache} from 'apollo-cache-inmemory'
import { createUploadLink } from 'apollo-upload-client'

import CRUD from './crud';
import UPLOAD from './upload';
import {WorkhubFS} from '@workerhive/ipfs'
import {useRealtime, RealtimeSync } from './yjs';
import jwt_decode from 'jwt-decode'

import { WorkhubProvider, useHub } from './react'

const ENVIRONMENT = (typeof process !== 'undefined') && (process.release && process.release.name === 'node') ? 'NODE' : 'BROWSER'
let Apollo, gql : any;
let BoostClient : any;
let ReactClient : any;


const getClient = async () => {
    if(ENVIRONMENT == "NODE"){
        Apollo = await import('apollo-boost');
        BoostClient = Apollo.ApolloClient
        gql = Apollo.gql
    }else{
        Apollo = await import('@apollo/client')
        ReactClient = Apollo.ApolloClient
        gql = Apollo.gql
    }
}


/*
if(ENVIRONMENT == "NODE"){
    const { ApolloClient, gql } = await import("apollo-boost")
}else{
    const { ApolloClient, gql, InMemoryCache } = await import("@apollo/client");
    const { setContext } = await import('@apollo/client/link/context');
}
*/




export {
    WorkhubProvider,
    useHub, 
    RealtimeSync,
    useRealtime
}


export class WorkhubClient {
    public lastUpdate: Date | null = null;

    private hubUrl: string;
    private hostURL: URL;
    private hostName: string;

    private client?: any;

    public models?: Array<any> = [];
    public uploadModels?: Array<any> = [];

    private platform: string = ENVIRONMENT
    
    public realtimeSync?: RealtimeSync;

    public fsLayer?: WorkhubFS;

    private accessToken?: string;
    private swarmKey?: string;

    public actions : any = {};
    constructor(url?: string, setup_fn?: Function, dispatch?: any) {
        this.hubUrl = url || 'http://localhost:4002';      
        this.hostURL = new URL(this.hubUrl)
        this.hostName = this.hostURL.hostname;
      //  this.initClient()

        if(ENVIRONMENT != "NODE"){
            console.info("Turning realtime on")
            this.realtimeSync = new RealtimeSync(this.hostName == 'localhost' ? 'thetechcompany.workhub.services' : this.hostName);
        }
        
        /*this.fsLayer = new WorkhubFS({
            Swarm: [
                `/dns4/${(this.hostName.hostname == "localhost" ? 'thetechcompany.workhub.services' : this.hostName.hostname)}/tcp/443/wss/p2p-webrtc-star`
            ]
        }, 'L2tleS9zd2FybS9wc2svMS4wLjAvCi9iYXNlMTYvCjVmYmNhYzhjMzliZDhlZTFlMmQzNzU4OGEwZjgyMTk1ZGQxMjU4MDI1Yzk3N2JiNWRkYzdlNjgyNjdjNjVjYjM=')
        */

        if(setup_fn){
            this.getModels().then(({crud, upload}) => {
                this.models = crud;
                this.uploadModels = upload;
                this.setupBasicReads(dispatch);
                this.setupFileActions(dispatch);

                setup_fn();
            })
        }
    }

    get user(): any{
        return jwt_decode(this.accessToken!)
    }

    canAccess(type: string, action: string){
        return this.user.permissions.indexOf(`${type}:${action}`) > -1
    }

    setAccessToken(token: string){
        this.accessToken = token
    }

    async setSwarmKey(key: string){
        this.swarmKey = key;
        if(this.fsLayer) await this.fsLayer.stop();
        this.fsLayer = new WorkhubFS({
            Bootstrap: [],
            Swarm: [
                `/dns4/${(this.hostName == "localhost" ? 'thetechcompany.workhub.services' : this.hostName)}/tcp/443/wss/p2p-webrtc-star`
            ]
        }, this.swarmKey)
    }

    async setup(dispatch: any){
        await this.initClient()
        const swarmKey = await this.getSwarmKey();
        await this.setSwarmKey(swarmKey)
        let {crud, upload} = await this.getModels();
        this.models = crud;
        this.uploadModels = upload;
        this.setupBasicReads(dispatch);
        this.setupFileActions(dispatch);
    }

    private authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
        const token = localStorage.getItem('token');
    // return the headers to the context so httpLink can read them
        return {
        headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "",
        }
       }
    });

    async initClient(){
        
        await getClient()
            let opts : any= {};
            console.debug('=> Setup client', this.hubUrl)
            opts.cache = new InMemoryCache({
                addTypename: false
            })

            if(ENVIRONMENT == "NODE"){
                opts.link = createHttpLink({
                    uri: `${this.hubUrl}/graphql`,
                    fetch: fetch,
                    headers: {
                        Authorization: this.accessToken ? `Bearer ${this.accessToken}` : "",
                    }
                })
                this.client = new BoostClient(opts)
            }else{
                opts.link = createUploadLink({
                    uri: `${this.hubUrl}/graphql`,
                    headers: {
                        Authorization: this.accessToken ? `Bearer ${this.accessToken}` : "",
                    }
                })
                this.client = new ReactClient(opts)
            }
        

    }

    authenticate(username: string, password: string){
        return fetch(`${this.hubUrl}/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                strategy: 'jwt',
                username: username,
                password: password
            })
        }).then((r :any) => r.json())
    }

    async query(query : string, variables : object = {}){
        let result = await this.client!.query({
            query: gql`${query}`,
            variables: variables
        })
        return result;
    }
    
    async mutation(query: string, variables: object = {}){
        let result = await this.client!.mutate({
            mutation: gql`${query}`,
            variables: variables
        })
        return result;
    }

    async getSwarmKey(){
        let result = await this.client!.query({
            query: gql`
                query GetSwarmKey{
                    swarmKey 
                }
            `
        })
        return result.data.swarmKey;
    }

    async getModels(){
        this.lastUpdate = new Date();
        let result = await this.query(
            `
                query GetTypes ($directives: [String]){
                    types(hasDirective: $directives)
                }
            `,
            {
                directives: ["crud", "upload", "configurable"]
            }
        )
        
    
        return {crud: result.data.types[0], upload: result.data.types[1], configurable: result.data.types[2]}
    }

    setupFileActions(dispatch: any){
        this.actions = {
            ...this.actions,
            ...UPLOAD(this.uploadModels, this.client, dispatch)
        }
    }

    setupBasicReads(dispatch: any){
        this.actions = CRUD(this.models, this.client, dispatch)

        
        this.models!.push({
            name: 'IntegrationStore',
            directives: [],
            def: [
                {name: 'id', type: 'ID'},
                {name: 'name', type: 'String'},
                {name: 'host', type: 'String'},
                {name: 'user', type: 'String'},
                {name: 'pass', type: 'Password'},
                {name: 'dbName', type: 'String'},
                {name: 'type', type: 'StoreType'}
            ]
        })

        this.models!.push({
            name: 'IntegrationMap', 
            directives: [],
            def: [
                {name: 'id', type: 'ID'},
                {name: 'nodes', type: 'JSON'},
                {name: 'links', type: 'JSON'},
            ]
        })

        this.actions['inviteTeamMember'] = async (id: string) => {
            let result = await this.mutation(`
                mutation InviteMember($id: ID){
                    inviteMember(id: $id)
                }
            `, {
                id
            })
            return result.data.inviteMember
        }

        this.actions['changePassword'] = async (current: string, next: string) => {
            let result = await this.mutation(`
                mutation ChangePassword($current: Hash, $next: Hash){
                    changePassword(current: $current, next: $next)
                }
            `, {
                current,
                next
            })
            return result.data.changePassword
        }


        this.actions['updateType'] = async (name : string, fields : any) => {
            let result = await this.mutation(`
                mutation UpdateType($name: String, $fields: JSON){
                    updateMutableType(name: $name, fields: $fields){
                        name
                        directives
                        def
                    }
                }
            `, {
                name,
                fields
            })
            let model_ix = this.models!.map((x) => x.name).indexOf(name)
            if(model_ix > -1){
                this.models![model_ix] = result.data.updateMutableType;
            }
            return result.data.updateMutableType
        }

        this.actions['getIntegrationMap'] = async (uuid : string) => {
            console.log("Integration Map", uuid)
            let result = await this.query(`
                query GetIntegrationMap($uuid: String){
                    integrationMap(uuid: $uuid){
                        uuid
                        id
                        nodes
                        links
                    }
                }
            `, {
                uuid: uuid
            }) 
            dispatch({type: 'GET_IntegrationMap', id: result.data.integrationMap.id, data: result.data.integrationMap})
            return result.data.integrationMap
        }

        this.actions['updateIntegrationMap'] = async (uuid: string, update: {nodes: any, links: any}) => {
            let result = await this.mutation(`
                mutation UpdateIntegrationMap($uuid: String, $update: IntegrationMapInput){
                    updateIntegrationMap(uuid: $uuid, integrationMap: $update){
                        id
                        nodes
                        links
                    }
                }
            `, {
                uuid,
                update
            })
            dispatch({type: 'UPDATE_IntegrationMap', id: result.data.updateIntegrationMap.id, data: result.data.updateIntegrationMap})
            return result.data.updateIntegrationMap;
        }

        this.actions['getStoreTypes'] = async () => {
            let result = await this.query(`
                query GetStoreTypes{
                    storeTypes {
                        id
                        name
                        description
                    }
                }
            `)
            dispatch({type: `GETS_StoreType`, data: result.data.storeTypes})
            return result.data.storeTypes;
        }

        this.actions['getStoreLayout'] = async (storeName: string) => {
            let result = await this.query(`
                query GetStoreLayout ($name: String){
                    storeLayout(storeName: $name)
                }
            `, {
                name: storeName
            })
            return result.data.storeLayout;
        }

        this.actions['getBucketLayout'] = async (storeName: string, bucketName: string) => {
            let result = await this.query(`
                query GetBucketLayout($storeName: String, $bucketName: String){
                    bucketLayout(storeName: $storeName, bucketName: $bucketName)
                }
            `, {
                storeName,
                bucketName
            })
            return result.data.bucketLayout;
        }

        this.actions['getIntegrationStores'] = async () => {
            let result = await this.query(`
                query GetStores {
                    integrationStores{
                        id
                        name
                        host
                        user
                        pass
                        dbName
                        type
                    }
                }
            `)
            dispatch({type: `GETS_IntegrationStore`, data: result.data.integrationStores})
            return result.data.integrationStores;
        }
        this.actions['addStore'] = async (store: any) => {
            let result = await this.mutation(`
                mutation AddStore($store: IntegrationStoreInput){
                    addIntegrationStore(integrationStore: $store){
                        id
                        name
                        host
                        user
                        pass
                        dbName
                        type
                    }
                }
            `, {
                store: store
            })
            dispatch({type: `ADD_IntegrationStore`, data: result.data.addIntegrationStore})
            return result.data.addIntegrationStore;
        }
        this.actions['updateStore'] = async (id: string, store: any) => {
            let result = await this.mutation(`
                mutation UpdateStore($id: String, $store: IntegrationStoreInput) {
                    updateIntegrationStore(id: $id, integrationStore: $store){
                        id
                        name
                        host
                        user
                        pass
                        dbName
                        type
                    }
                }
            `, {
                store: store,
                id: id
            })
            dispatch({type: `UPDATE_IntegrationStore`, data: result.data.updateIntegrationStore, id: id})
            return result.data.updateIntegrationStore
        }
        this.actions['deleteStore'] = async (id: string) => {
            let result = await this.mutation(`
                mutation DeleteStore($id: String){
                    deleteIntegrationStore(id: $id)
                }
            `, {
                id: id
            })
            dispatch({type: `DELETE_IntegrationStore`, id: id})
            return result.data.deleteIntegrationStore;
        }
    }
}