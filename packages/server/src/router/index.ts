import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import { FlowConnector } from '@workerhive/flow-provider';
import HiveGraph from '@workerhive/graph';
import crypto from 'crypto';
import jwt from 'jsonwebtoken'
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import multer from 'multer';
import { WorkhubFS } from '@workerhive/ipfs';
import MQ from '@workerhive/mq';
import { Mailer } from '../mailer';

export interface RouterOpts {
    jwtSecret: string;
}

export interface RouterConnectors{
    connector: FlowConnector;
    graph: HiveGraph;
    mq: MQ;
    fs: WorkhubFS;
    mailer: Mailer;
}

export class Router {
    private app: express.Express;

    private opts: RouterOpts;

    private fs: WorkhubFS;
    private mq: MQ;
    private connector: FlowConnector;
    private graph: HiveGraph;
    private mailer: Mailer;

    constructor(opts: RouterOpts, connectors: RouterConnectors) {
        this.opts = opts;

        this.connector = connectors.connector;
        this.graph = connectors.graph;
        this.fs = connectors.fs;
        this.mq = connectors.mq;
        this.mailer = connectors.mailer;


        this.app = express();

        this.app.use(bodyParser.json())
        this.app.use(cors())

        this.init();
    }

    listen(port: number){
        this.app.listen(port)
    }

    init() {
        passport.use(new JwtStrategy({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: this.opts.jwtSecret,
            //issuer: process.env.WORKHUB_DOMAIN ? process.env.WORKHUB_DOMAIN : 'workhub.services',
            // audience: process.env.WORKHUB_DOMAIN ? process.env.WORKHUB_DOMAIN : 'workhub.services'
        }, async (jwt_payload, done) => {
            let user = await this.connector.read("TeamMember", { id: jwt_payload.sub })
            if (user) {
                done(null, user)
            } else {
                done(null, false)
            }
        }))

        this.initAuthRoutes()
        this.initGraph();
    }

    signToken(info: any) {
        return jwt.sign(info, this.opts.jwtSecret);
    }

    initGraph() {
        this.graph.addTransport((conf: any) => {
            this.app.post('/graphql',
                passport.authenticate('jwt', { session: false }),
                multer().single('file'),
                (req: any, res) => {
                    let query = req.body.query;
                    let variables = req.body.variables || {};
                    if (variables && typeof (variables) !== 'object') variables = JSON.parse(variables)
                    if (req.file) variables.file = req.file;
                    this.graph.executeRequest(
                        query,
                        variables,
                        req.body.operationName,
                        {
                            user: req['user'],
                            fs: this.fs,
                            mq: this.mq,
                            mail: this.mailer
                        }
                    ).then((r) => res.send(r))
                })
        })
    }

    initAuthRoutes() {
        this.app.post('/forgot', async (req, res) => {
            const user: any = await this.connector.read('TeamMember', { email: req.body.email })
            if (user && user.id) {
                const token = this.signToken({ id: user.id })
                let mailResult = await this.mailer.forgotPassword(user, token)
                res.send({ success: true, message: mailResult })
            } else {
                res.send({ error: "User not found" })
            }
        })

        this.app.post('/login', async (req, res) => {
            let username = req.body.username;
            let password = crypto.createHash('sha256').update(req.body.password).digest('hex');
            let user: any = await this.connector.read("TeamMember", { username: username, password: password })
            if (user.id) {
                res.send({
                    token: this.signToken({
                        sub: user.id,
                        name: user.name,
                        email: user.email
                    })
                })
            } else {
                console.log("User result", user)
                res.status(404).send({ error: "No user found" })
            }
        })
    }
}