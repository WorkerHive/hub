import React, { Component, useEffect } from 'react';

import { Editor, HiveProvider, NodePanel, useEditor, withEditor } from "@workerhive/hive-flow"
import '@workerhive/hive-flow/dist/index.css'
import './index.css';
import { useHub } from '@workerhive/client/dist/react';

import * as ExtStore from './nodes/ext-store';
import * as ExtAdapter from './nodes/ext-adapter';
import * as TypeDefNode from './nodes/type-def'
import { link } from 'fs';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { AdminEditor } from './editor';

export interface AdminViewProps{
    stores: any;
    map: any;
}

export const AdminView: React.FC<AdminViewProps> = (props) => {

    console.log(props.map)
    const [ client, store, isReady, err ] = useHub()

    const editor = useEditor();
    const [ nodes, setNodes ] = React.useState<any>(props.map && props.map.nodes ? props.map.nodes : [])
    const [ links, setLinks ] = React.useState<any>(props.map && props.map.links ? props.map.links : [])

    useEffect(() => {
        if(props.map && props.map.nodes){
            setNodes(props.map.nodes)
        }

        if(props.map && props.map.links){
            setLinks(props.map.links)
        }
    }, [props.map])

    console.log(client!.models!)
    

    const displayNodes = client!.models! ? client!.models!.filter((a) => a.directives.indexOf('configurable') > -1).map((x: any, ix :number) => ({
                    id: `type-${x.name}`,
                    type: 'typeDef',
                    position: {
                        x: ix * 200,
                        y: 200,
                    },
                    data: {
                        status: 'typing',
                        label: x.name,
                        typedef: x.def,
                    }
                })).concat((props.stores || []).map((x: any, ix : number) => ({
                    id: `store-${x.name}`,
                    type: 'extStore',
                    position: {
                        x: ix * 200,
                        y: 350
                    },
                    data: {
                        status: 'warning',
                        label: x.name
                    }
                }))).concat(nodes) : []

    const types = [TypeDefNode, ExtStore, ExtAdapter]

    const [ modalOpen, openModal ] = React.useState<boolean>(false);

    const [ Modal, setModal ] = React.useState<any>();
    const [ selectedNode, setNode ] = React.useState<any>();

    const [ filterLink, setFilterLink ] = React.useState<any>([]);

    return (
        <div className="admin-view">

            <HiveProvider store={{
                nodeTypes: types,
                nodes: displayNodes,
                links: links.filter((a : any) => filterLink.map((x : any) => x.id).indexOf(a.id) == -1),
                statusColors: {
                    typing: 'green',
                    new: 'yellow',
                    warning: 'orange',
                },
                exploreNode: (id: string) => {
                    let node : any = Object.assign({}, displayNodes.filter((a) => a.id == id)[0])
                    const type = types.filter((a) => a.type == node.type)[0]
                    node.type = type;
                    setNode(node)
                },
                onNodeAdd: (node: any) => {
                    client!.actions.updateIntegrationMap('root-map', {nodes: nodes.concat(node), links: links})
                    setNodes(nodes.concat([node]))
                },
                onNodeUpdate: (id: string, updated: any) => {
                    client!.actions.updateIntegrationMap('root-map', {nodes: nodes, links: links})
                },  
                onLinkAdd: (link : any) => {
                    client!.actions.updateIntegrationMap('root-map', {nodes: nodes, links: links.concat([link])})
                    console.log("Addd link", link)
                   setLinks(links.concat([link])) 
                },
                onLinkRemove: (_links : any) => {
                    const link = links.filter((a : any) => {
                        let ix = _links.map((x : any) => x.id).indexOf(a.id)
                        return ix == -1
                    })
                    setFilterLink(filterLink.concat(_links))
                   // setLinks(link)
                }
            }}>
                <AdminEditor onClose={() => setNode(null)} selected={selectedNode} />
            </HiveProvider>
        </div>    
    )
}