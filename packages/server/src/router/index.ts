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
import fetch from 'node-fetch';

const upload = multer()

export interface RouterOpts {
    jwtSecret: string;
}

export interface RouterConnectors {
    connector: FlowConnector;
    graph: HiveGraph;
    mq: MQ;
    fs: WorkhubFS;
    mailer: Mailer;
}

export interface Enquiry {
    source: string;
    email: string;
    phone: string;
    name: string;
    company: string;
    country: string;
    city: string;
    preferred_contact: string[];
    message: string;
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

        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.app.use(bodyParser.json())
        this.app.use(cors())

        this.init();
    }

    listen(port: number) {
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
                let roles = jwt_payload.roles || []
                let permissions = jwt_payload.permissions || []

                if(!jwt_payload.roles || !jwt_payload.permissions){
                    var userPermissions = await this.userPermissions(user.roles.id)
                    roles = userPermissions.roles
                    permissions = userPermissions.permissions
                }
                let signed_user = {
                    ...user,
                    roles: roles.map((x) => ({name: x.name, id: x.id})),
                    permissions: permissions
                }
                console.log("User", signed_user);
                done(null, signed_user)
            } else {
                done(null, false)
            }
        }))

        this.initAuthRoutes()
        this.initExternalRoutes();
        this.initGraph();
    }

    signToken(info: any) {
        return jwt.sign(info, this.opts.jwtSecret);
    }

    async userPermissions(role_ids: string[]) {
        let roles = await this.connector.readAll("Role", { id: { $in: role_ids } })
        let perms = {};

        roles.forEach((role) => {
            Object.keys(role.permissions).forEach((perm) => {
                Object.keys(role.permissions[perm]).forEach((rec) => {
                    if (role.permissions[perm][rec]) {
                        perms[`${perm}:${rec}`] = true;
                    }
                })
            })
        })

        return {permissions: Object.keys(perms), roles: roles.map((x) => ({name: x.name, id: x.id}))}
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

    initExternalRoutes() {
        this.app.post('/ext', upload.none(), async (req, res) => {
            switch (req.body.form_type) {
                case 'contact_us':
                    let contact: Enquiry = {
                        source: req.body.form_name,
                        email: req.body.email,
                        phone: req.body.phone,
                        name: req.body.contact_name,
                        company: req.body.cf_text_2,
                        country: req.body.country,
                        city: req.body.city,
                        preferred_contact: req.body.cf_checkbox_1,
                        message: req.body.message
                    }
                    let captcha_token = req.body['g-recaptcha-response']

                    if (captcha_token && process.env.RECAPTCHA_SECRET) {
                        let captcha_body = {
                            secret: process.env.RECAPTCHA_SECRET,
                            response: captcha_token
                        }
                        console.log("Captcha body")

                        fetch(`https://www.google.com/recaptcha/api/siteverify`, {
                            method: 'POST',
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: `secret=${captcha_body.secret}&response=${captcha_body.response}`
                        }).then((r) => {
                            return r.json();
                        }).then(async (result) => {
                            console.log("Recaptcha result", result);

                            if (result.success) {
                                //Send mail
                                await this.mailer.contactMessage(contact)
                                res.send({ success_message: req.body.success_message })
                            } else {
                                console.log("Captcha error", result['error-codes'])
                                res.send({ status: 0, error_message: "Invalid captcha response" })
                            }
                        })


                    } else if (!process.env.RECAPTCHA_SECRET) {
                        console.log("Mailer not set up with recaptcha")
                        await this.mailer.contactMessage(contact)
                        res.send({ success_message: req.body.success_message })
                    }
                    /*
                   

                    
                    */
                    break;
                default:
                    console.log("External data collector", req.body)
                    res.send({ status: 0, error_message: "No data collector set up" })
                    break;
            }

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

        this.app.post('/signup',                 
            passport.authenticate('jwt', { session: false }),
            async (req, res) => {
                let password = crypto.createHash('sha256').update(req.body.password).digest('hex')
                let user = {
                    username: req.body.username.toLowerCase(),
                    password: password,
                    name: req.body.name,
                    email: req.body.email,
                    phone_number: req.body.phone_number
                }
                let exists = await this.connector.read("TeamMember", {username: user.username})
                if(exists && Object.keys(exists).length > 0 && req['user'].id != exists.id){
                    console.log("Signup", req['user'], exists)
                    res.send({error: "Username already taken"})
                }else{
                    let new_user = await this.connector.update("TeamMember", {id: req['user'].id}, user)
                    res.send({
                        token: this.signToken({
                            sub: new_user.id,
                            name: new_user.name,
                            email: new_user.email
                        })
                    })
                }
        })

        this.app.post('/login', async (req, res) => {
            let username = req.body.username.toLowerCase();
            let password = crypto.createHash('sha256').update(req.body.password).digest('hex');
            let user: any = await this.connector.read("TeamMember", { username: username, password: password })
            if (user.id) {
                if(user.roles && user.roles.id){
                    var { permissions, roles} = await this.userPermissions(user.roles.id)
                } 
                res.send({
                    token: this.signToken({
                        sub: user.id,
                        permissions: permissions || [],
                        roles: roles || [],
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