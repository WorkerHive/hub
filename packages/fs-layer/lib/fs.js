const IPFS = require('ipfs');
const {P2PStack} = require('./p2p-stack')

const FSNode = async (config, repo, key) => {
    const node = await IPFS.create({
        repo: repo,
        libp2p: P2PStack(key),
        config: {
            Bootstrap: config.Bootstrap || [],
            Addresses: {
                Swarm: config.Swarm || [],
            },
            Discovery: {
                webRTCStar: {Enabled: true},
                MDNS: {Enabled: true}
            }
        },
        relay: {enabled: true, hop: {enabled: true}}
    })
    return {node, libp2p: node.libp2p}
}

module.exports = {
    FSNode
}