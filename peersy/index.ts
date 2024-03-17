import { Peer } from "./peer"
import { CannotDisconnect } from "./errors"

export var connectedPeers: Peer[] = [] // array of currently connected peers
export var blacklist: number[] = [] // array of content IDs to stop propagating

export enum Platform {web, lnx, win, and, ios}

export interface Content {
    id: number,
    data: string
}

export interface Packet {
    index: number,
    content: string
}

export interface PartialContent {
    id: number,
    length: number,
    packets: Packet[]
}

export function addToBlacklist(contentID: number) {
    blacklist.push(contentID)
}

export function disconnectPeer(peer: Peer) {
    if (peer.forbidDisconnect) {
        throw CannotDisconnect
    }

    let peerAt = connectedPeers.findIndex(peer => peer === peer)
    connectedPeers.splice(peerAt, 1)
}

export { Peer } from "./peer"
export { BlacklistedContent } from "./errors"