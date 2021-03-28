import React, { useContext, Context, createContext, useEffect, useReducer } from 'react';
import { WorkhubClient } from '.';
import { clientReducer } from './store';

declare global {
    interface Window {
        hubClient? :WorkhubClient
    }
}

const HubContext = React.createContext<[WorkhubClient | undefined, any, Boolean, Error | null]>([undefined, {}, false, null])


export const WorkhubProvider = ({children, token, url} : ProviderProps) => {
    const [ hub, store, isReady, err ] = useHubHook(url, token || '');
    
    return (
        <HubContext.Provider value={[hub, store, isReady, err]} >
            {typeof(children) === 'function' ? children(hub, store, isReady, err) : children}
        </HubContext.Provider>
    )
}

export const useHubHook = (url : string, token: string) : [WorkhubClient | undefined, any, Boolean, Error | null] => {
    const [ hubUrl, setUrl ] = React.useState<string>('') 
    const [ client, setClient ] = React.useState<WorkhubClient>();
    const [ isReady, setReady ] = React.useState<boolean>(false);
    const [ error, setError ] = React.useState<Error | null>(null);

    const [{store}, dispatch] = React.useReducer(clientReducer, {store: {}})


    useEffect(() => {
        async function startClient(url : string, token: string){
            console.log("Start client")
            try{
                if(window.hubClient){
                    console.log("Existing hub client", window.hubClient)
                    window.hubClient.setAccessToken(token)

                    setClient(window.hubClient as WorkhubClient)
                    setReady(true)
                  /*  if(!window.hubClient.models?.lastUpdate || window.hubClient.models.lastUpdate?.getTime() < new Date().getTime() - 15 * 60 * 1000){
                        console.log("Starting hub client")
                        window.hubClient.setup(dispatch).then(() => {
                            //Maybe check time since last update?
                            setClient(window.hubClient as WorkhubClient)
                            setReady(true)
                        })
                    
                    }*/
                }else{
                    let cli = new WorkhubClient(url);
                    cli.setAccessToken(token)
                    cli.setup(dispatch).then(() => {
                        window.hubClient = cli;
                        setClient(cli as WorkhubClient)
                        setReady(true)
                    });
                }
                setError(null);
            }catch(e){
                console.error("Error setting up client", e)
                setClient(undefined);
                setReady(false)
                setError(e)
            }
        }
        async function stopClient(){
            console.log("Stop client")
            setClient(undefined);
            setReady(false)
            setError(null);
        }
        console.log(url, setClient, setError, setReady)

        if(hubUrl != url){
            console.log("URL", url, hubUrl)
            setUrl(url)
            stopClient().then(() => startClient(url, token))
        }
        return () => {
           //stopClient();
        }

    }, [url, hubUrl, setUrl, window])

    return [client, store, isReady, error];
}

export interface ProviderProps {
    children: any;
    token?: string;
    url: string;
}

export const useHub = () => {
    const context = useContext(HubContext)
    return context
}
