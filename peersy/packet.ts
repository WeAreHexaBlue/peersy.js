import * as peersy from "./index"
import * as crypto from "crypto"

export class Packet {
    partOf: peersy.Content
    index: number
    sender: peersy.Peer
    recipient?: peersy.Peer
    content?: string
    encContent?: Buffer

    constructor(partOf: peersy.Content, index: number, sender: peersy.Peer, recipient?: peersy.Peer, content?: string) {
        this.partOf = partOf
        this.index = index
        this.sender = sender
        this.recipient = recipient
        this.content = content
    }

    encrypt() {
        if (!(this.recipient && this.content)) {return}

        this.encContent = crypto.publicEncrypt(this.recipient.publicKey, Buffer.from(this.content))

        this.content = undefined
    }
}