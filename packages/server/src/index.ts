import { typeDefs, resolvers as typeResolvers } from './types';
import express from 'express';

import { merge } from 'lodash'
import nodemailer from "nodemailer"

import { Router } from './router'
import MQ from '@workerhive/mq';

import { WorkhubFS } from "@workerhive/ipfs"

import HiveGraph from '@workerhive/graph';

import { IPFS, CRUD } from '@workerhive/plugins'

import Mail from 'nodemailer/lib/mailer';
import { Mailer } from './mailer';
import { Realtime } from './realtime';
import QueenDB from '@workerhive/queendb';



const app = express();

export interface WorkhiveServerOpts {
    swarmKey?: string;
    workhubDomain?: string;
    mqUrl?: string;
    jwtSecret: string;
}

export class WorkhiveServer {
    private fsLayer: WorkhubFS;
    private db: QueenDB
    private mqLayer: MQ;

    //private realtimeSync: Realtim
    private graph: HiveGraph;
    private mailer: Mailer;
    private router: Router;

    private realtime: Realtime;

    private opts: WorkhiveServerOpts;

    constructor(opts: WorkhiveServerOpts) {
        this.opts = opts;

        this.initFS();

        if (opts.mqUrl) this.initMQ();
        if (!opts.mqUrl) console.log("Hub: Starting without a message queue MQ_URL not provided")

        console.log("Init flow");

        this.initFlow();
        
        console.log("Init mail")
        this.initMail();
        console.log("Init realtime")
        this.initRealtime();

        console.log("Init router")
        this.initRouter();

    }

    initRealtime(){
        this.realtime = new Realtime(this.opts.workhubDomain)
    }

    initRouter() {
        this.router = new Router({
            jwtSecret: this.opts.jwtSecret
        }, {
            mq: this.mqLayer,
            fs: this.fsLayer,
            mailer: this.mailer,
            graph: this.graph,
            connector: this.db
        });

        this.router.listen(4002);

        console.log("Router listening")
    }

    initMail() {

        //TODO add options for smtp
        let mailOpts : any = {};
        if(process.env.O365_USER && process.env.O365_PASS){
            mailOpts = {
                service: 'Outlook365',
                auth: {
                    user: process.env.O365_USER,
                    pass: process.env.O365_PASS
                }
            }
        }else{
           mailOpts = {
            host: process.env.SMTP_SERVER || 'mail',
            port: process.env.SMTP_PORT || 25,
            secure: (process.env.SMTP_PORT || 25) == '465'
            }

        if (process.env.SMTP_USER || process.env.SMTP_PASS) {
            mailOpts.auth = {};
            mailOpts.auth.user = process.env.SMTP_USER;
            mailOpts.auth.pass = process.env.SMTP_PASS;
        }
    }

     if(mailOpts && Object.keys(mailOpts).length > 0)   this.mailer = new Mailer(mailOpts);
    }

    initFlow() {
        this.db = new QueenDB({
            host: process.env.QUEENDB_HOST || 'localhost',
            port: 5432,
            database: 'postgres',
            user: 'postgres',
            password: process.env.QUEENDB_PASS || 'password'
        })

        const workhubResolvers = merge({
            Query: {
                swarmKey: (parent) => {
                    return this.fsLayer.swarmKey
                }
            }
        }, typeResolvers)

        this.initGraph(workhubResolvers)
        /*

        this.connector = new FlowConnector({}, {})
        let { types, resolvers } = this.connector.getConfig();
        const workhubResolvers = merge({
            Query: {
                swarmKey: (parent) => {
                    return this.fsLayer.swarmKey
                }
            }
        }, merge(resolvers, typeResolvers))

        this.initGraph(types, workhubResolvers);*/

    }

    initGraph(resolvers) {
        this.graph = new HiveGraph({
            types: `

            extend type Query {
                swarmKey: String
            }

            extend type Mutation{
                empty: String
            }

            
            type Workflow @crud @configurable{
                id: ID
                name: String @input
                nodes: [JSON] @input
                links: [JSON] @input
            }

            ${typeDefs}
        `,
         resolvers,
         directives: {
             crud: [CRUD(this.db)],
             upload: [IPFS(this.fsLayer)]
         }
        });
        //, this.connector, true)
    }

    initFS() {
        let swarmDomain = `/dns4/${this.opts.workhubDomain ? this.opts.workhubDomain : 'thetechcompany.workhub.services'}/tcp/443/wss/p2p-webrtc-star`
        console.log("IPFS: Swarm Domain", swarmDomain)
        
        this.fsLayer = new WorkhubFS({
            Swarm: [
                swarmDomain
            ]
        }, this.opts.swarmKey)

        if (!this.opts.swarmKey) {
            //Write swarm key
        }
    }

    initMQ() {
        this.mqLayer = new MQ({
            host: this.opts.mqUrl,
            ready: () => {
                this.mqLayer.watch('ipfs-pinning', this.ipfsPinService.bind(this)).then(() => {
                    console.log("Watching ipfs-pinning")
                })
            }
        })
    }

    async ipfsPinService(blob: any) {
        let { cid, filename, id } = blob;
        let timeout = 15;
        console.log(`FS-Pin: Started ${cid}`)

        let cid2 = await this.fsLayer.pinFile(cid, timeout * 60 * 1000)

        if (cid2) {
            console.log(`FS-Pin: Pinned ${cid2}`)
            //Add file pin notice to YJS
            console.log(`FS-Pin: Added file pin to "file-pins" yjs map ${cid}`)
            const filePins = this.realtime.doc.getMap('file-pins')
            
            filePins.set(cid, {date: new Date().getTime()})

            let res = await this.db.updateCell('File', { id: id }, { pinned: true })
            return res;
        } else {
            console.log(`FS-Pin: Couldnt pin in ${timeout}mins, trying again soon`)
            return null;
        }

    }

}
