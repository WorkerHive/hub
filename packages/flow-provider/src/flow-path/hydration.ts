export const hydrate = (nodes : Array<{id: string, type: string, data: any}>, links : Array<{id: string, source: string, target: string}>) => {
    let flow = {};
    const adapters = nodes.filter((a) => a.type == 'extAdapter').map((adapter) => {
        let storeLink = links.find((link) => link.source == adapter.id)
        let typeLink = links.find((link ) => link.target == adapter.id)

       // let storeNode = nodes.find((node) => node.id == storeLink.target)
       // let typeNode = nodes.find((node) => node.id == typeLink.source)

        let store = storeLink.target.replace(/store-/, '')
        let type = typeLink.source.replace(/type-/, '')

        let flowMap = {}

        Object.keys(adapter.data.type_map).forEach((key) => {
            if(adapter.data.type_map[key] != 'n/a'){
                if(key === 'id'){
                    flowMap['refs'] = {id: [`app:${type}:id`]}
                }
                flowMap[key] = `${store}:${adapter.data.collection}:${adapter.data.type_map[key]}`
            }
        })

        flow[type] = flowMap;
    });

    return flow;
}