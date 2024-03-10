import * as peersy from "./index"
import * as crypto from "crypto"

export class Peer {
    publicKey: string
    #privateKey: string

    platform: peersy.Platform

    constructor(platform: peersy.Platform) {
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

        this.publicKey = peersy.keyStrip(publicKey, "PUBLIC")
        this.#privateKey = peersy.keyStrip(privateKey, "PRIVATE")
    }

    async request(contentID: number) {
        peersy.emitter.emit("req", this, contentID)
    }
}