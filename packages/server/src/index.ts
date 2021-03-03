import Graph, { LoggerConnector } from '@workerhive/graph' 
import { typeDefs } from './types';
import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import crypto from 'crypto';
import { merge } from 'lodash'
import jwt from 'jsonwebtoken';
import passport from 'passport';
import multer from 'multer';
import nodemailer from "nodemailer"

import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

import MQ from '@workerhive/mq';
import { WorkhubFS } from "@workerhive/ipfs"

import { FlowConnector } from '@workerhive/flow-provider'

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret',
    //issuer: process.env.WORKHUB_DOMAIN ? process.env.WORKHUB_DOMAIN : 'workhub.services',
   // audience: process.env.WORKHUB_DOMAIN ? process.env.WORKHUB_DOMAIN : 'workhub.services'
}

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    let user = await connector.read("TeamMember", {id: jwt_payload.sub})
    if(user){
        done(null, user)
    }else{
        done(null, false)
    }
}))
  
const app = express();

const fsLayer = new WorkhubFS({
    Swarm: [
        `/dns4/${process.env.WORKHUB_DOMAIN ? process.env.WORKHUB_DOMAIN : 'thetechcompany.workhub.services'}/tcp/443/wss/p2p-webrtc-star`
    ]
}, null, )

const mqLayer = new MQ({
    host: process.env.MQ_URL || 'amqp://rabbitmq:rabbitmq@rabbit1',
    ready: () => {
        mqLayer.watch('ipfs-pinning', async (blob: any) => {

            console.log("Pinning in background", blob)

            let {cid, filename, id} = blob;

            console.log("Pinning", cid)

            let cid2 = await fsLayer.pinFile(cid)

            console.log("Pinned", cid2)

            let res = await connector.update('File', {id: id}, {pinned: true})

            console.log("Pinning result", res)
            return res;
        }).then(() => {
            console.log("Watching ipfs-pinning")
        })
    }
})

let connector = new FlowConnector({}, {})

let { types, resolvers } = connector.getConfig();

const workhubResolvers = merge({
    Query: {
        swarmKey: (parent) => { 
            return fsLayer.swarmKey
        }
    }
}, resolvers)

let hiveGraph = new Graph(`

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

    ${types}
    ${typeDefs}
`, workhubResolvers, connector, true)

/*connector.stores.initializeAppStore({
    url: (process.env.WORKHUB_DOMAIN ? 'mongodb://mongo' : 'mongodb://localhost'),
    dbName: (process.env.WORKHUB_DOMAIN ? 'workhub' : 'workhub')
})*/


app.use(bodyParser.json())
app.use(cors())

let mailOpts : any = {
    host: process.env.SMTP_SERVER || 'mail',
    port: process.env.SMTP_PORT || 25,
    secure: (process.env.SMTP_PORT || 25) == '465'
}

if(process.env.SMTP_USER || process.env.SMTP_PASS){
    mailOpts.auth = {};
    mailOpts.auth.user = process.env.SMTP_USER;
    mailOpts.auth.pass = process.env.SMTP_PASS;
}

const mailTransport = nodemailer.createTransport(mailOpts)

app.post('/forgot', async (req, res) => {
    const info = await mailTransport.sendMail({
        from: `"WorkHive" <noreply@workhub.services>`,
        to: "professional.balbatross@gmail.com",
        subject: "Test Forgotten password",
        text: "Forgot password please reset, if this was not you please click the link below",
        html: "<div>Forgot password</div>"
    })
    console.log(info.messageId);

    res.send({info})
})

app.post('/login', async (req, res) => {
    let strategy = req.body.strategy;

    let username = req.body.username;
    let password = crypto.createHash('sha256').update(req.body.password).digest('hex');
    let user : any = await connector.read("TeamMember", {username: username, password: password})
    console.log(username, password);
    if(user.id){
        console.log("Success user", user)
        res.send({token: jwt.sign({
            sub: user.id,
            name: user.name,
            email: user.email
        }, 'secret')})
    }else{
        console.log("User result", user)
        res.status(404).send({error: "No user found"})
    }
})

hiveGraph.addTransport((conf:any) => {
    
    app.post('/graphql', passport.authenticate('jwt', {session: false}), multer().single('file'), (req : any, res) => {
        let query = req.body.query;
        let variables = req.body.variables || {};
        if(variables && typeof(variables) !== 'object') variables = JSON.parse(variables)
        if(req.file) variables.file = req.file; 
        hiveGraph.executeRequest(
            query,
            variables,
            req.body.operationName,
            {
                user: req['user'], 
                fs: fsLayer,
                mq: mqLayer
            }
        ).then((r) => res.send(r))
    })

    app.get('/graphql', (req, res) => {
        res.sendFile(__dirname + '/index.html')
    })
    
})

app.listen(4002)
