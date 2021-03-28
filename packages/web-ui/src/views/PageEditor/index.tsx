import { useHub } from '@workerhive/client';
import React from 'react';
import { LayoutEditor } from '../../components/layout-editor';
import * as Components from '@workerhive/react-ui'
import { identity, isNil, omitBy, pickBy } from 'lodash';
import './index.css';
const WorkUI : any = {...Components}

export interface PageEditorProps {
    match: any;
}

export const PageEditor : React.FC<PageEditorProps> = (props) => {

    const pageName = `${props.match.params.type}-${props.match.params.page_id}`

    const [ hub, isReady, err ] = useHub();
    
    const [ loaded, setLoaded ] = React.useState<boolean>(false);
    const [ layout, setLayout ] = React.useState<any>([])

    React.useEffect(() => {
        hub?.actions('getPageLayout')(pageName).then((result : any) => {
            console.log(result)
            if(result.items && result.items.length > 0){
                let items = result.items;
                setLayout(items.map((x : any) => {
                   let Component = WorkUI[x.component]
                   return omitBy({ 
                      ...x,
                      component: <Component />,
                      componentName: x.component
                   }, isNil)
                }))
              //  setLayout(result.items)
            }
            setLoaded(true)
        })
    }, [])

    return (
        <LayoutEditor layout={layout} onLayoutChange={(layout: any) => {
            setLayout(layout)
            console.log("Sending update", layout)
            if(loaded){
                hub?.actions('updatePageLayout')(pageName, {items: layout.map((x : any) => {
                let ret = { ...x, component: x.componentName }
                delete ret.componentName
                return ret;
                }), data: {}}) 
            }
        }}/>
    )
}