import React from 'react';

import { AccordionList } from "@workerhive/react-ui"
import { SettingsMap } from './settings-map'
import './index.css';
import { useHub } from '@workerhive/client';
import { Typography } from '@material-ui/core';
const pjson = require('../../../package.json');

export interface SettingsProps{
    history: any;
}

export default function Settings (props: SettingsProps){
  const [ converters, setConverters ] = React.useState([])
  const [ stores, setStores ] = React.useState([])

  const [ client, store, isReady ] = useHub();

  React.useEffect(() => {
    client?.actions.getStoreTypes().then((data : any) => {
      setStoreTypes(data)
    })

    client?.actions.getIntegrationStores().then((data : any) => {
      setStores(data)
    })

   /* getStoreTypes().then((types : any) => {
      console.log("TYOES", types)
      setStoreTypes(types);
    })

    props.getStores();
 */

    /*getConverters().then((converters) => {
      console.log(converters)
      setConverters(converters)
    })*/
  }, [])

  const roles = [
    {
      name: "Admin"
    },
    {
      name: "Editor"
    },
    {
      name: "User"
    }
  ]

  const [ storeTypes, setStoreTypes ] = React.useState([]);

    return (
        <div className="settings-view">
            <AccordionList 
              items={SettingsMap(props, stores, storeTypes, converters, roles)} />
            <Typography variant="subtitle1">Workhive Hub v{pjson.version}</Typography>
        </div>
    )
}