import { Peer } from "./peer"
import { CannotDisconnect } from "./errors"
import * as events from "node:events"
import * as crypto from "crypto"

export var connectedPeers: Peer[] = [] // array of currently connected peers
export var blacklist: number[] = [] // array of content IDs to stop propagating

export var emitter: events.EventEmitter = new events.EventEmitter()

export enum Platform {web, lnx, win, and, ios}

export interface Content {
    id: number,
    data: string,
    enc: string
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

    let peerAt = connectedPeers.findIndex(thisPeer => thisPeer === peer)
    connectedPeers.splice(peerAt, 1)
}

export async function encrypt(content: Content, recipient: Peer): Promise<Content> {
    let enc = crypto.publicEncrypt(recipient.publicKey, Buffer.from(content.data)).toString("base64url")

    content.data = ""
    content.enc = enc

    return content
}

export async function find(contentID: number, requester: Peer): Promise<Content | null> {
    let content: Content | null = null

    connectedPeers.forEach(peer => {
        peer.content.forEach(async content => {
            if (content.id === contentID) {
                content = await encrypt(content, requester)
                return
            }
        })
        if (content) {return}
    })

    return content ? content : null
}

export { Peer } from "./peer"
export { BlacklistedContent, AlreadyDecrypted } from "./errors"