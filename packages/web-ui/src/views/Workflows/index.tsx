import React from 'react';

import { Editor, HiveProvider, NodePanel } from "@workerhive/hive-flow"
import { Header } from '@workerhive/react-ui'
import '@workerhive/hive-flow/dist/index.css'
import './index.css';
import { MenuView } from '../../components/menu-view';

import { useHub } from '@workerhive/client'

export interface WorkflowsProps{

}

export default function Workflows(props: React.FC<WorkflowsProps>){

    const [ client, err ] = useHub()

    const [ nodes, setNodes ] = React.useState<Array<any>>([])
    const [ links, setLinks ] = React.useState<Array<any>>([])
    const [ workflow, setWorkflow ] = React.useState<any>({})
    const [ workflows, setWorkflows ] = React.useState<Array<any>>([]);

    React.useEffect(() => {
        console.log(client!.actions)
        client!.actions.getWorkflows().then((workflows : any) => {
            setWorkflows(workflows)
        })
   
    }, [client])

    const _onNodeAdd = (node: any) => {
        updateNodes(nodes.concat([node]))
    }  

    const _onLinkAdd = (link: any) => {
        updateLinks(links.concat([link]))
    }

    const updateLinks = (links : any) => {
        setLinks(links)
        if(workflow.id) client!.actions.updateWorkflow(workflow.id, {links: links})
    }

    const updateNodes = (nodes : any) => {
        setNodes(nodes)
        console.log(workflow)
        if(workflow.id) client!.actions.updateWorkflow(workflow.id, {nodes: nodes})
    }

    return (
        <div className="workflows-view">
            <Header tabs={[]} title="Workflows" />
            <MenuView 
                title={"Workflows"}
                structure={{name: 'String'}}
                onClick={({item }: any) => {
                    client!.actions.getWorkflow(item.id).then((workflow : any) => {
                        console.log(workflow)
                        setWorkflow(workflow)
                        setNodes(workflow.nodes || [])
                        setLinks(workflow.links || [])
                    })
                }}
                onSave={({item}:any) => {
                    client!.actions.addWorkflow(item).then((r : any) => {
                      
                        alert("Saved")
                    })
                    console.log(item)
                }}
                items={workflows}>
            <HiveProvider 
            store={{
                direction: 'horizontal',
                nodes: nodes,
                links: links,
                onNodeAdd: _onNodeAdd,
                onLinkAdd: _onLinkAdd,
                onNodeUpdate: (id: any, node: any) => {
                    let n = nodes.slice()
                    let ix = n.map((x: any) => x.id).indexOf(id);
                    n[ix] = {
                        ...n[ix],
                        ...node
                    }
                    updateNodes(n)
                },
                onNodeRemove: (node: any) => {
                    let n = nodes.slice().filter((a: any) => node.map((x: any) => x.id).indexOf(a.id) < 0);
                    updateNodes(n)
                    console.log(node)
                },
                onLinkRemove: (link: any) => {
                    let l = links.slice().filter((a: any) => link.map((x: any) => x.id).indexOf(a.id) < 0);
                    updateLinks(l);
                },
                statusColors: {
                    'undefined': 'gray'
                }
            }}>
                <Editor />
                <NodePanel />
            </HiveProvider>
            </MenuView>
        </div>
    )
}