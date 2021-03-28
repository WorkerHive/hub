import { Fab, Typography } from "@material-ui/core"
import { Delete } from "@material-ui/icons";
import Add from '@material-ui/icons/Add'
import Edit from "@material-ui/icons/Edit"
import { WorkhubClient } from "@workerhive/client";
import { MSContactCard } from '@workerhive/parsers';
import { MutableDialog, Header, SearchTable, MoreMenu, FileDrop } from "@workerhive/react-ui"
import qs from "qs";

import React from "react"
import { Route, Switch } from "react-router-dom";
import { CompanyView } from "./company";
import { PeopleView } from "./people";

export const CONTACT_COMPANY_VIEW = {
    path: '/dashboard/companies',
    label: 'Companies',
    data: {
        organisations: {
            type: '[ContactOrganisation]'
        }
    },
    layout: (sizes: any, rowHeight: number) => [
        {
            i: 'header',
            x: 0,
            y: 0,
            w: 12,
            h: 1,
            component: (data: any, params: any) => (
                <Header
                    title={data.label} />
            )
        },
        {
            i: 'data',
            x: 0,
            y: 0,
            w: 12,
            h: (sizes.height / rowHeight) - (sizes.width < 600 ? 2 : 1),
            component: (data: any, params: any, type: any, client: any) => {
                let t: any = {}
                if (type["ContactOrganisation"]) type["ContactOrganisation"].def.forEach((_type: any) => {
                    t[_type.name] = _type.type;
                })

                let models = [client.models.getByName("ContactOrganisation")]
                models[0].data = data.organisations

                let extras = {
                    client,
                    data,
                    models,
                    type: t
                }
                return <CompanyView {...extras} />
            }
        }
    ]
}

export const CONTACT_VIEW = {
    path: '/dashboard/contacts',
    label: "Contacts",
    data: {
        contacts: {
            type: '[Contact]'
        },
        organisations: {
            type: '[ContactOrganisation]'
        }
    },
    layout: (sizes: any, rowHeight: number) => [
        {
            i: 'header',
            x: 0,
            y: 0,
            w: 12,
            h: 1,
            component: (data: any, params: any) => (
                <Header
                    onTabSelect={({ tab }) => {
                        params.navigate(`/dashboard/contacts/${tab.toLowerCase()}`)
                        /*let query = qs.parse(window.location.search, {ignoreQueryPrefix: true})
                        query.type = tab.toLowerCase();
                        window.location.search = qs.stringify(query)
                        console.log(tab)*/
                    }}
                    title={data.label}
                    tabs={[]} />
            )
        },
        {
            i: 'data',
            x: 0,
            y: 1,
            w: 12,
            h: (sizes.height / rowHeight) - (sizes.width < 600 ? 2 : 1),
            component: (data: any, params: any, type: any, client?: WorkhubClient) => {
                const t: any = {};
                console.log(type)
                if (type["Contact"]) type["Contact"].def.forEach((_type: any) => {
                    t[_type.name] = _type.type;
                })

                let models = [client?.models?.getByName("ContactOrganisation")] 
                models[0].data = data.organisations

                let extras = {
                    client,
                    data,
                    models,
                    type: t
                }
                return <PeopleView {...extras} />

            }
        }
    ]
}