import * as peersy from "./index"
import * as crypto from "crypto"

export class Peer {
    status?: peersy.Status
    platform: peersy.Platform
    publicKey: string
    #privateKey: string

    constructor(platform: peersy.Platform) {
        this.platform = platform

        let {publicKey, privateKey} = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "pkcs1",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs1",
                format: "pem"
            }
        })

        this.publicKey = publicKey
        this.#privateKey = privateKey
    }

    async request(id: number) {
        this.status = peersy.Status.req
        peersy.emitter.emit("req", this, ) // unfinished but i had to go
    }
}