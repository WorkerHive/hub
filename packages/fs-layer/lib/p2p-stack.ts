const ENVIRONMENT = (typeof process !== 'undefined') && (process.release && process.release.name === 'node') ? 'NODE' : 'BROWSER'

const MDNS = require('libp2p-mdns')
const Bootstrap = require('libp2p-bootstrap')

let TCP: any, wrtc : any;
if(ENVIRONMENT == "NODE") {
    console.log("ENV", ENVIRONMENT)
    TCP = require('libp2p-tcp')
    wrtc = require('wrtc')
}
const MPLEX = require('libp2p-mplex');
const NOISE = require('libp2p-noise').NOISE;
const Protector = require('libp2p/src/pnet');
const WebRTCStar = require('libp2p-webrtc-star')

const transportKey = WebRTCStar.prototype[Symbol.toStringTag]

const wrtcTransport : any = {
    enabled: true,
}

const peerDiscovery = {
    autoDial: false,
    [Bootstrap.tag]: {
        enabled: false,
        list: []
    },
    [WebRTCStar.tag]:{
        enabled: true
    }
}

console.log("peer discovery", peerDiscovery)

if(ENVIRONMENT == "NODE") {
    peerDiscovery[MDNS.tag] = {
        enabled: true
    }
    wrtcTransport.wrtc = wrtc
}

export const P2PStack = (swarmKey: Uint8Array) => ({
    modules: {
        transport: ENVIRONMENT == "NODE" ? [TCP, WebRTCStar] : [WebRTCStar],
        streamMuxer: [MPLEX],
        connEncryption: [NOISE],
        connProtector: new Protector(swarmKey),
    },
    config: {
        transport: {
            [transportKey]: wrtcTransport
        },
        peerDiscovery: peerDiscovery
    }
})
