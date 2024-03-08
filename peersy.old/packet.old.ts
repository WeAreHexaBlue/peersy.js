import * as peersy from "./index.old"
import * as crypto from "crypto"

export class Packet {
    partOf: peersy.Content
    index: {property: string, index: number}
    sender: peersy.Peer
    recipient?: peersy.Peer
    content?: string
    encContent?: string

    constructor(partOf: peersy.Content, index: {property: string, index: number}, sender: peersy.Peer, recipient?: peersy.Peer, content?: string) {
        this.partOf = partOf
        this.index = index
        this.sender = sender
        this.recipient = recipient
        this.content = content
    }

    encrypt() {
        if (!(this.recipient && this.content)) {return}

        this.encContent = crypto.publicEncrypt(this.recipient.publicKey, Buffer.from(this.content)).toString("hex")

        this.content = undefined
    }

    decrypt(privateKey: string) {
        if (!this.encContent) {return}

        this.content = crypto.privateDecrypt(privateKey, Buffer.from(this.encContent)).toString("utf8")

        this.encContent = undefined
    }
}