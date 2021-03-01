import React, { useCallback } from 'react';

import { Autocomplete } from '@material-ui/lab'
import { NodeWrapper, useEditor, withEditor } from '@workerhive/hive-flow';
import { QueryBuilder } from '@material-ui/icons';
import { FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Typography, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';
import { useHub } from '@workerhive/client';

export const type = 'extAdapter'

const Modal = (props: any) => {

    const client = props.client;
    const editor = props.editor;

    const [selectedTable, setSelectedTable] = React.useState<any>();
    const [tableColumns, setTableColumns] = React.useState<any>([])
    const [ typeMap, setTypeMap ] = React.useState<any>({});

    const [storeTables, setStoreTables] = React.useState<any>([])

    let node = editor.nodes.find((a: any) => a.id === props.node.id)

    const getStore = useCallback(() => {
        let storeLink = editor.links.filter((a: any) => a.source == props.node.id)[0]
        console.log(storeLink)
        if (storeLink) {
            let storeNode = editor.nodes.filter((a: any) => a.id == storeLink.target)[0]
            return storeNode
        }
    }, [])

    const getModel = () => {
        let storeLink = editor.links.filter((a: any) => a.target == props.node.id)[0]
        if (storeLink) {
            let storeNode = editor.nodes.filter((a: any) => a.id == storeLink.source)[0]
            return storeNode;
        }
    }

    const updateModelLink = (target: string) => {
        let storeLink = editor.links.filter((a: any) => a.target == props.node.id)[0]
        if (storeLink) {
            props.editor.addLink(target, props.node.id)
            props.editor.onElementsRemove([storeLink])

        }
    }

    const setFieldSQL = (key: string, sql: string | null) => {
        let m = Object.assign({}, typeMap);
        m[key] = sql != null ? {sql: sql} : ''
        console.log(key, sql, m)
        setTypeMap(m)
    }

    const renderFields = () => {
        let type: any = getModel();
        let returnType = type.data.typedef.map((x: any) => {
            
            const selected : any = typeMap[x.name];
            console.log(undefined === selected)
            return (
                <div style={{ borderBottom: '1px solid green', marginBottom: 4, paddingBottom: 4, display: 'flex', alignItems: 'center' }}>
                    <Typography style={{ flex: 1 }} variant="subtitle1">{x.name}</Typography>

                    {selected && selected.sql != null ? (
                        <textarea 
                          value={selected.sql}
                          onChange={(e) => setFieldSQL(x.name, e.target.value)}
                          style={{flex: 1}}
                          placeholder="SQL Query" />
                    ) : (
                    <Select
                        value={selected || ''}
                        onChange={(e: any) => {
                            let map = Object.assign({}, typeMap);
                            map[x.name] = e.target.value;
                            setTypeMap(map)

                        /*  editor.updateNode(props.node.id, (node: any) => {
                                if (!node.data.type_map) node.data.type_map = {};
                                node.data.type_map[x.name] = e.target.value;
                                console.log(node.data)
                                return node;
                            })*/
                        }}
                        style={{ flex: 1 }}>
                        {(tableColumns || []).filter((a: any) => {
                            //TODO helpful field type checks here
                            return true;
                        }).map((column: any) => (
                            <MenuItem value={column.name}>{column.name}</MenuItem>
                        ))}
                        <MenuItem value={'n/a'}>N/A</MenuItem>
                    </Select>
                    )}
                    <IconButton onClick={() => {
                        if(selected && selected.sql){
                            setFieldSQL(x.name, null)
                        }else{
                            setFieldSQL(x.name, '')
                        }
                    }}>
                        <QueryBuilder />
                    </IconButton>
                </div>
            )
        })
        console.log("RENDERING")
        return (
            <div style={{ marginTop: 8 }}>
                <Typography variant="h6">Adapter Map</Typography>
                {returnType}
            </div>
        )
    }

    React.useEffect(() => {
        if(props.node && props.node.data){
            console.log("NODE DATA", props.node.data)
            if(props.node.data.type_map) setTypeMap(props.node.data.type_map)
            if(props.node.data.fields) setTableColumns(props.node.data.fields);
            if(props.node.data.collection) setSelectedTable({name: props.node.data.collection});
        }

        let store = getStore();
        console.log("Fetch layout", store.data.label)
        client?.actions.getStoreLayout(store.data.label).then((data: any) => {
            console.log(data);
            setStoreTables(data)
        })
    }, [client, getStore, props.node])

    console.log(props.node.data)

    return (
        <>
            <DialogTitle>Update Adapter</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ flex: 1, flexDirection: 'column', display: 'flex' }}>
                    <FormControl>
                        <InputLabel>Store</InputLabel>
                        <Select value={getStore().id}>
                            {editor.nodes.filter((a: any) => a.type == 'extStore').map((x: any) => {
                                return <MenuItem value={x.id}>{x.data.label}</MenuItem>
                            })}
                        </Select>
                    </FormControl>
                    <FormControl>
                        <InputLabel>Model</InputLabel>
                        <Select value={getModel().id} onChange={(e) => {
                            updateModelLink(`${e.target.value}`)
                        }}>
                            {editor.nodes.filter((a: any) => a.type == 'typeDef').map((x: any) => (
                                <MenuItem value={x.id}>{x.data.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Autocomplete
                        getOptionSelected={(option: any, value: any) => option.name === value.name}
                        value={selectedTable || {name: ''}}
                        onChange={(event, newValue) => {

                            setSelectedTable(newValue);

                            if (newValue && newValue.name) {
                                /*editor.updateNode(props.node.id, (node : any) => {
                                    console.log("Update node details", newValue);
                                    node.data.collection = {name: newValue.name};
                                    return node;
                                })*/

                                client?.actions.getBucketLayout(getStore().data.label, newValue.name).then((data: any) => {
                                    /*                        editor.updateNode(props.node.id, (node : any) => {
                                                                node.data.fields = data;
                                                                return node;
                                                            })*/
                                    console.log("BUCKET COLS", data);
                                    setTableColumns(data)
                                })
                            }
                        }}
                        options={storeTables || []}
                        getOptionLabel={(option: any) => option.name}
                        renderInput={(params) => <TextField {...params} margin="dense" label="Store Bucket" />}
                    />
                    {renderFields()}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button onClick={() => {
                    editor.updateNode(props.node.id, (node : any) => {
                        node.data.fields = tableColumns;
                        node.data.collection = selectedTable.name;
                        node.data.type_map = typeMap;
                        return node;
                    })
                    props.onClose()
                    console.log(tableColumns, selectedTable, typeMap)
                }} color="primary" variant="contained">Save</Button>
            </DialogActions>
        </>
    )
}

export const modal = Modal;

export const node = withEditor((props: any) => {
    return (
        <NodeWrapper {...props}>
            <div style={{ padding: 8 }} className="ext-adapter">
                {props.id && props.data.label || "External Adapter"}
            </div>
        </NodeWrapper>
    )
})
