import * as peersy from "./index"
import * as crypto from "crypto"

export class Peer {
    publicKey: string
    #privateKey: string

    platform: peersy.Platform

    content: peersy.Content[]
    partialContent: peersy.PartialContent[]

    forbidDisconnect: boolean

    constructor(platform: peersy.Platform, content: peersy.Content[]=[], partialContent: peersy.PartialContent[]=[]) {
        this.platform = platform

        let {publicKey, privateKey} = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            }
        })

        this.publicKey = publicKey
        this.#privateKey = privateKey

        this.content = content
        this.partialContent = partialContent

        this.forbidDisconnect = false

        peersy.connectedPeers.push(this)
    }

    async request(contentID: number) {
        if (contentID in peersy.blacklist) {
            throw peersy.BlacklistedContent
        }

        let magnet = crypto.randomBytes(8).toString("base64url")

        peersy.emitter.emit("request", contentID, this, magnet)
    }

    async decrypt(content: peersy.Content): Promise<peersy.Content> {
        if (content.data && !content.enc) {throw peersy.AlreadyDecrypted}

        let data = crypto.privateDecrypt(this.#privateKey, Buffer.from(content.enc, "base64url")).toString("utf8")

        content.data = data
        content.enc = ""

        return content
    }
}