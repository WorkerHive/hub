declare global {
    interface Window {
        workhubFS: WorkhubFS
    }
}

import { setContext } from 'apollo-link-context'

import { WorkhubFS } from '@workerhive/ipfs'
import { useRealtime, RealtimeSync } from './yjs';
import jwt_decode from 'jwt-decode'

import { WorkhubProvider, useHub } from './react'
import { Postman } from './postman'
import { ActionFactory } from './actions'
import { ModelStorage } from './models'
import { Auth } from './auth'
import { Graph } from './graph';

const ENVIRONMENT = (typeof process !== 'undefined') && (process.release && process.release.name === 'node') ? 'NODE' : 'BROWSER'
let Apollo, gql: any;
let BoostClient: any;
let ReactClient: any;





/*
if(ENVIRONMENT == "NODE"){
    const { ApolloClient, gql } = await import("apollo-boost")
}else{
    const { ApolloClient, gql, InMemoryCache } = await import("@apollo/client");
    const { setContext } = await import('@apollo/client/link/context');
}
*/

const FALLBACK_URL = "rainbow.workhub.services"

export interface UserInfo {
    username?: string;
    password?: string;
    confirm_password?: string;
    name?: string;
    email?: string;
    phone_number?: string;
}



export {
    WorkhubProvider,
    useHub,
    RealtimeSync,
    useRealtime
}


export class WorkhubClient {
    public lastUpdate: Date | null = null;

    public hubUrl?: string;
    private hostURL?: URL;
    private hostName?: string;

    private client?: Graph;

    //public models?: Array<any> = [];
    public uploadModels?: Array<any> = [];

    private platform: string = ENVIRONMENT

    public realtimeSync?: RealtimeSync;

    public fsLayer?: WorkhubFS;

    public accessToken?: string;
    private swarmKey?: string;

    public models?: ModelStorage

    private postman: Postman;

    public actionFactory?: ActionFactory;

    public auth: Auth;

    public query: (query: string, variables?: object) => any = () => { };
    public mutation: (query: string, variables?: object) => any = () => { };

    constructor(url?: string, setup_fn?: Function, dispatch?: any) {
        this.updateBaseURL(url)
        //  this.initClient()

        console.log("Starting hub client with ", this.hubUrl + '/api')
        this.postman = new Postman(`${this.hubUrl}/api`)

        let token = localStorage.getItem('token')
        if (token && token.length > 0 && typeof (token) === 'string') {
            this.accessToken = token;
        }

        this.auth = new Auth(this, this.postman)

        if (ENVIRONMENT != "NODE") {
            console.info("Turning realtime on")
            this.realtimeSync = new RealtimeSync(this.hostName!);
        }

        if (setup_fn) {

            this.setupGraph().then(() => {
        
                this.models = new ModelStorage(this);

                this.models.getTypes().then((types) => {
                    this.actionFactory = new ActionFactory(this, this.models!, dispatch)
                    setup_fn();
                })
            })


        }
    }

    updateBaseURL(url?: string) {
        this.hubUrl = url || 'http://localhost:4002';
        this.hostURL = new URL(this.hubUrl)
        this.hostName = this.hostURL.hostname;

        if (!this.hostName || this.hostName == 'localhost') {
            this.hostName = FALLBACK_URL;
        }

        if (this.postman) this.postman.updateBaseURL(url)
    }

    get user(): any {
        return jwt_decode(this.accessToken!)
    }

    crudAccess(type: string) {
        return ["read", "create", "update", "delete"].filter((a) => this.canAccess(type, a))
    }

    canAccess(type: string, action: string) {
        return this.user.permissions.indexOf(`${type}:${action}`) > -1
    }

    setAccessToken(token: string) {
        this.accessToken = token
    }

    actions(func_name: string) {
        return this.actionFactory?.getFunction(func_name);
    }

    async initIPFS(swarmKey: string) {
        console.log("INIT IPFS")
        this.swarmKey = swarmKey;
        if(swarmKey){
            console.log(globalThis)
            let globalIPFS: WorkhubFS = window.workhubFS;
            if (globalIPFS){
                console.log("Existing IPFS found, stopping...")
                await globalIPFS.stop();
            } 
            window.workhubFS = new WorkhubFS({
                Bootstrap: [],
                Swarm: [
                    `/dns4/${this.hostName}/tcp/443/wss/p2p-webrtc-star`
                ]
            }, this.swarmKey)

        }
    }


    async setupGraph(){
        this.client = await Graph.from(this);

        this.query = this.client.query.bind(this.client);
        this.mutation = this.client.mutation.bind(this.client);
    }

    async setup(dispatch: any) {
        await this.setupGraph();        

        const swarmKey = await this.getSwarmKey();
        await this.initIPFS(swarmKey)

        this.models = new ModelStorage(this);
        await this.models.getTypes();
        this.actionFactory = new ActionFactory(this, this.models, dispatch)

    }


    async getSwarmKey() {
        let result = await this.client?.query(`
                query GetSwarmKey{
                    swarmKey 
                }
            `)
        return result.data.swarmKey;
    }


    setupBasicReads(dispatch: any) {
        /*
                
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
        
                this.actions['getIntegrationMap'] = async (id : string) => {
                    console.log("Integration Map", id)
                    let result = await this.query(`
                        query GetIntegrationMap($id: String){
                            integrationMap(id: $id){
                                id
                                nodes
                                links
                            }
                        }
                    `, {
                        id: id
                    }) 
                    dispatch({type: 'GET_IntegrationMap', id: id, data: result.data.integrationMap})
                    return result.data.integrationMap
                }
        
                this.actions['updateIntegrationMap'] = async (id: string, update: {nodes: any, links: any}) => {
                    let result = await this.mutation(`
                        mutation UpdateIntegrationMap($id: String, $update: IntegrationMapInput){
                            updateIntegrationMap(id: $id, integrationMap: $update){
                                id
                                nodes
                                links
                            }
                        }
                    `, {
                        id,
                        update
                    })
                    dispatch({type: 'UPDATE_IntegrationMap', id: id, data: result.data.updateIntegrationMap})
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
        
       */
    }
}