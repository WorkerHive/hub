const ENVIRONMENT = (typeof process !== 'undefined') && (process.release && process.release.name === 'node') ? 'NODE' : 'BROWSER'

const MDNS = require('libp2p-mdns')
const Bootstrap = require('libp2p-bootstrap')

let TCP, wrtc;

if(ENVIRONMENT == "NODE") {
    console.log("ENV", ENVIRONMENT)
    TCP = require('libp2p-tcp')
    wrtc = require('wrtc')
}
const Libp2p = require('libp2p')
const MPLEX = require('libp2p-mplex');
const NOISE = require('libp2p-noise').NOISE;
const Protector = require('libp2p/src/pnet');
const WebRTCStar = require('libp2p-webrtc-star')

const transportKey = WebRTCStar.prototype[Symbol.toStringTag]
console.log(transportKey, WebRTCStar.tag)

const wrtcTransport = {
    enabled: true,
}

const peerDiscovery = {
    autoDial: true,
    [transportKey]: {
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

export const P2PStack = (swarmKey) => {
    return {
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
    }
}
