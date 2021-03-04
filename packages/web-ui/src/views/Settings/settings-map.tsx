import { Button, Typography, TextField } from '@material-ui/core';
import { CRUDList } from '@workerhive/react-ui';
import { useHub } from '@workerhive/client'
import React from 'react';


export const SettingsMap = (props: any, stores: any, storeTypes : any, converters : any, _roles: any) => {
  const [ client, store, isReady, err ] = useHub()

  const [ models, setModels ] = React.useState<any>([]);
  const [ roles, setRoles ] = React.useState<any>([])

  React.useEffect(() => {
    client?.getModels().then(models => {
      setModels(models.crud)
    });

    client?.actions.getRoles().then((roles: any) => {
      setRoles(roles)
    })
  }, [])

  return [
    {
      title: <Typography variant="h6" style={{display: 'flex'}}>Profile</Typography>,
      body: (
      <div>
        <TextField label="Current password" />
        <TextField label="New Password" />
        <TextField label="Confirm Password" />
      </div>
      )
    },
    {
      title: <Typography variant="h6" style={{display: 'flex'}}>Add-ons</Typography>,
      body: <CRUDList title={"Add-ons"} data={converters} />
    },
    {
      title: <Typography variant="h6" style={{display: 'flex'}}>Connections</Typography>,
      body: (
        <CRUDList 
          title={"Connections"} 
          onDelete={({item}: any) => {
            if(item && item.id){
              client?.actions.deleteStore(item.id)
            }
            
          }}
          onSave={({item} : any) => {
            let obj = Object.assign({}, item)
            if(!obj.id){
              client?.actions.addStore(obj)
            }else{
              const id = obj.id;
              delete obj.id;
              console.log("UPDATE STORE", id, obj)

              client?.actions.updateStore(id, obj)
            }
          }}
          type={{name: 'String', type: {type: 'Select', items: storeTypes, key: 'id'}, host: 'String', user: 'String', pass: 'Password', dbName: 'String'}} 
          data={store.IntegrationStore} />
      )
    },
    {
      title: <Typography variant="h6" style={{display: 'flex'}}>Roles</Typography>,
      body: (
        <CRUDList 
          title={"Roles"} 
          onDelete={({item}: any) => {
            client?.actions.deleteRole(item.id)
          }}
          onSave={({item}: any) => {
            let obj = Object.assign({}, item);
            if(!obj.id){
              client?.actions.addRole(obj)
            }else{
              const id = obj.id;
              delete obj.id;
              client?.actions.updateRole(id,obj)
            }
          }}
          type={{
            name: 'String', 
            permissions: {
              type: 'Table', 
              items: models.filter((a: any) => a.directives.indexOf('configurable') > -1)
            }
          }} 
          data={store.Role} />
      )
    },
    {
      title: <Typography variant="h6" style={{display: 'flex'}}>Data Flow</Typography>,
      body: (
        <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          <Typography color="secondary">Warning: changing these settings is dangerous don't enter unless you know what you're doing</Typography>
          <Button variant="contained" color="primary" onClick={() => props.history.push(`/dashboard/admin`)}>Go to editor</Button>
        </div>
      )
    },
    {
      title: <Typography variant="h6" style={{display: 'flex'}}>Data types</Typography>,
      body: (
        <CRUDList title={"Types"} type={{name: 'String', def: 'KV'}} data={models} 
          onEdit={({item}: any) => {
            props.history.push(`${props.match.url}/type-editor/${item.name}`)
          }}
          onSave={({item} : any) => { 
            console.log(item) 
          }} />   
      )
    }
  ]
}