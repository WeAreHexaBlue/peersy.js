import { Peer } from "./peer"
import { CannotDisconnect, ChunkFailure } from "./errors"
import * as events from "node:events"
import * as crypto from "crypto"

export var connectedPeers: Peer[] = [] // array of currently connected peers
export var blacklist: number[] = [] // array of content IDs to stop propagating

export var emitter: events.EventEmitter = new events.EventEmitter()

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

export async function packetize(content: Content, recipient: Peer): Promise<Packet[]> {
    let encContent = crypto.publicEncrypt(recipient.publicKey, Buffer.from(content.data)).toString("base64url")
    let contentChunks = encContent.match(/.{1,40}/g)

    if (!contentChunks) {throw ChunkFailure}

    let packets: Packet[] = []
    contentChunks.forEach((chunk, index) => {
        packets.push({index: index, content: chunk})
    })

    return packets
}

export async function find(contentID: number, requester: Peer): Promise<PartialContent | null> {
    let content: PartialContent | null

    let packets: Packet[] = []
    connectedPeers.forEach(peer => {
        peer.content.forEach(async content => {
            if (content.id === contentID) {
                packets = await packetize(content, requester)
                return
            }
        })
        if (packets) {return}
    })

    return packets.length ? {
        id: contentID,
        length: packets.length,
        packets: packets
    } : null
}

export { Peer } from "./peer"
export { BlacklistedContent } from "./errors"