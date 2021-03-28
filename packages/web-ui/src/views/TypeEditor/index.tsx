import { List, ListItem, Paper, Typography } from '@material-ui/core';
import React from 'react';
import { CRUDKV, Header } from "@workerhive/react-ui"
import './index.css';
import Add from '@material-ui/icons/Add';
import { useHub } from '@workerhive/client';

export interface TypeEditorProps{
    match: any;
    history: any;
}

export const TypeEditor : React.FC<TypeEditorProps> = (props) => {
    const [ type, setType ] = React.useState<any>({def: [{name: 'ID', type: 'ID'}]})

    const [ client, isReady, err ] = useHub();

    const editPage = (page : string) => {
        props.history.push(`${props.match.url}/pages/${page}`)
    }

    React.useEffect(() => {
        if(isReady && client){
            let type = client?.models?.getByName(props.match.params.type)
            setType({def: type.def, name: type.name})
        }
    }, [])

    return (
        <div className="type-editor">
            <Header title={props.match.params.type}/>
            <div className="type-editor__body">
                <div className="type-editor__details">
                    {/*<div style={{display: 'flex', alignItems: 'center'}}>
                        <IconButton onClick={() => props.history.push(`/dashboard/settings`)}><ArrowBack /></IconButton><Typography variant="h6">{props.match.params.type} </Typography>
                    </div>*/}
                    
                    <Paper className="type-editor__types">
                        <CRUDKV types={client?.models?.types?.crud || []} value={type.def} onChange={({value} : any) => {

                          let fields = value.filter((a : {type: string, name: string}) => a.type.length > 0)
                          let newFields = fields.filter((a: any) => {
                            return type.def.map((x: any) => `${x.name}:${x.type}`).indexOf(`${a.name}:${a.type}`) < 0
                          })

                          if(newFields.length > 0){
                              client?.actions('updateType')(type.name, newFields)
                            /*client!.actions.updateType(type.name, value.filter((a : any) => {
                                return a.name && a.name.length > 0 && a.type && a.type.length > 0
                            }).filter((a: any) => {
                                return type.def.map((x: any) => x.name + ":"+JSON.stringify(x.def)).indexOf(`${a.name}:${JSON.stringify(a.def)}`)
                            }))*/
                            }
                            setType({name: type.name, def: value});

                        }} />
                    </Paper>

                    <Paper className="type-editor__views">
                        <Typography variant="subtitle1">Views</Typography>
                        <List>
                            <ListItem button onClick={() => editPage('default')}>{props.match.params.type} Home</ListItem>
                            <ListItem button style={{display: 'flex', justifyContent: 'center'}}><Add /> Create new page</ListItem>
                        </List>
                    </Paper>
                </div>
                <Paper className="type-editor__integrations">
                    <Typography variant="subtitle1">Integrations</Typography>
                    <List>
                        <ListItem button style={{display: 'flex', justifyContent: 'center'}}><Add /> Add Integration</ListItem>
                    </List>
                </Paper>
            </div>
        </div>
    )
}