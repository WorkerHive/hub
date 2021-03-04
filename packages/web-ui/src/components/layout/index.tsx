import React, { Suspense, lazy, useRef } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout'
import { WorkhubClient, useHub } from '@workerhive/client'
import useResizeAware from 'react-resize-aware';
import 'react-grid-layout/css/styles.css';
import { isEqual } from 'lodash';
const ReactGridLayout = WidthProvider(RGL);

const Header = lazy(() => import('@workerhive/react-ui').then((r) => ({ default: r.Header })))
const SearchTable = lazy(() => import('@workerhive/react-ui').then((r) => ({ default: r.SearchTable })))

export interface LayoutItem {
    x: number;
    y: number;
    w: number;
    h: number;
    i: string;
    maxW?: number;
    maxH?: number;
    component: (store: any, params?: any, type?: object, client?: WorkhubClient | null) => any;
}

export interface LayoutProps {
    schema: {
        layout: (sizes: any, rowHeight: number) => Array<LayoutItem>,
        data: any,
        label: string,
        path: string
    },
    match: any;
    history: any;
}

const defaultProps = {
    items: 20,
    rowHeight: 50,
    cols: 12,
}

export const Layout: React.FC<LayoutProps> = (props) => {

    const [resizeListener, sizes] = useResizeAware();

    const [client, store, isReady, err] = useHub();

    const [ schema, setSchema ] = React.useState<any>();

    const [data, setData] = React.useState<any>({})
    const [types, setTypes] = React.useState<any>({})

    React.useEffect(() => {
        if (client != null && !isEqual(props.schema, schema)) {

            if (props.schema.data) {
                /*
                    Data fetching schema
                    {
                        [key]: {
                            type: 'GraphType',
                            query: `getGraphType(id: $id)`
                        }
                    }
                */
                let _types : any = {};
                (async () => {
                    for (const k in props.schema.data) {
                        //Pull name from data object
                        let name = props.schema.data[k].type;
                        console.log("Get Data", name)
                        const pollLength : number = props.schema.data[k].poll || undefined;
                        const liveData : boolean = props.schema.data[k].live || false;

                        if(!name) continue;

                        let isArray = false;
                        let query = typeof(props.schema.data[k].query) === 'function' ? props.schema.data[k].query(props.match.params) : {}

                        //Check to see if it's an array type
                        if (name.match(/\[(.*?)\]/)) {
                            name = name.match(/\[(.*?)\]/)[1]
                            isArray = true;
                        }

                        //Fetch the full Model Description
                        let model = client.models?.concat(client.uploadModels).filter((a : any) => a.name === name)[0]

                        if (model) {
                            //Key the model to types state
                            console.log("TYPES", types)
                            _types[model.name] = model;
                          //  setTypes(t);

                            let currentValue;

                            //Check for data in cache if not delegate to fetch
                            if (isArray) {
                                currentValue = store[model.name]
                                console.log("Current value", currentValue, store, model.name)
                                if (currentValue && currentValue.length > 1) {
                                    console.log("Current value", currentValue)
                                } else {
                                    if(pollLength && pollLength > 0){
                                        console.log("Registering poll length", pollLength, model.name)
                                        if(!window.layout_polls) window.layout_polls = [];
                                        window.layout_polls.push(setInterval(async () => {
                                            console.log("Fetch", model.name)
                                            await client.actions[`get${model.name}s`](false);
                                        }, pollLength))
                                    }
                                    let result = await client.actions[`get${model.name}s`]()

                                    currentValue = result //store[model.name]

                                }
                            } else {
                                currentValue = store[model.name] ? store[model.name].filter((a: any) => {
                                    let matches = true;
                                    for (var k in (query || {})) {
                                        if (a[k] != query[k]) {
                                            matches = false;
                                            break;
                                        }
                                    }
                                    return matches;
                                }) : []
                                console.log("Not array run", currentValue)
                                if (currentValue.length > 0) {
                                    currentValue = currentValue[0]
                                    console.log("CUrrent Valye", currentValue)
                                } else {
                                    let result = await client.actions[`get${model.name}`](query.id)
                                    currentValue = result
                                    console.log("had to fetch fresh data", currentValue)
                                }
                            }

                            console.log("KEYING", k, currentValue)
                            let d = Object.assign({}, data)
                            d[k] = currentValue;
                            setData(d)


                        }
                    }
                })()
                setTypes(_types)
                setSchema(props.schema)
            }
        }
        return () => {
            if(window.layout_polls){
                window.layout_polls.forEach((timer : any) => {
                    clearInterval(timer);
                })
            }
        }
    }, [props.schema, schema, client, props.match.params, data, store, types])

    function getData() : object{
        console.log("Get data called")
        let obj : any = {};

        for(const k in props.schema.data){
            let name = props.schema.data[k].type;
            const liveData: boolean = props.schema.data[k].live || false;


            if(!name) continue;
            let arr = (name.match(/\[(.*?)\]/) != null)
            if(arr) name = name.match(/\[(.*?)\]/)[1]

            let model = client?.models?.concat(client?.uploadModels).filter((a : any) => a.name === name)[0]

            let query = typeof(props.schema.data[k].query) === 'function' ? props.schema.data[k].query(props.match.params) : {}
            
            if(liveData) console.log("LIVE", client?.realtimeSync?.getArray('calendar', model).toArray())

            obj[k] = arr ? 
                (liveData ? client?.realtimeSync?.getArray(name, model).toArray() : (store[name] || []) )
                : (liveData ? client?.realtimeSync?.getArray(name, model).toArray().filter((a : any) => {
                    let match = true;
                    for(var queryK in query){
                        if(a[queryK] != query[queryK]){
                            match = false;
                        }
                    }
                    return match;
                })[0] : (store[name] ? store[name].filter((a: any) => {
                    let match = true;
                    for(var queryK in query){
                        console.log("query", queryK, query, a);
                        if(a[queryK] != query[queryK]){
                            match = false;
                        }
                    }
                    return match;
                })[0] : {}))
        }

        return obj
    }

    const _data = getData();

    return (
        <Suspense fallback={<div>loading</div>}>
            {resizeListener}
            <ReactGridLayout
                style={{ flex: 1 }}
                {...defaultProps}
                isDraggable={false}
                isResizable={false}
                layout={props.schema.layout(sizes, 64)}
                onLayoutChange={(layout) => { }}
                isBounded={true}>
                {props.schema.layout(sizes, 64).map((x) => (
                    <div key={x.i} style={{ display: 'flex', flexDirection: 'column' }}>
                        {x.component instanceof Function ? x.component({
                            ..._data,
                            label: props.schema.label,
                            path: props.schema.path
                        }, { ...props.match.params, navigate: (url: string) => props.history.push(url) }, types, client) : x.component}
                    </div>
                ))}
            </ReactGridLayout>
        </Suspense>
    )
}