import * as peersy from "./index"

export class Packet {
    id: number
    partOf: peersy.Content
    sender: peersy.Peer
    recipient: peersy.Peer
    content: string

    constructor(partOf: peersy.Content, sender: peersy.Peer, recipient: peersy.Peer, content: string) {
        this.id = peersy.latestIDs.packet + 1
        this.partOf = partOf
        this.sender = sender
        this.recipient = recipient
        this.content = content

        peersy.latestIDs.packet = this.id
    }
}