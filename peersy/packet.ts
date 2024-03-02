import * as peersy from "./index"

export class Packet {
    id: number
    partOf: peersy.Content
    sender: peersy.Peer
    recipient: peersy.Peer
    content: string

    constructor(partOf: peersy.Content, sender: peersy.Peer, recipient: peersy.Peer, content: string) {}
}