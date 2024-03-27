import * as peersy from "./index"
import * as crypto from "crypto"

export class Peer {
    publicKey: string
    #privateKey: string

    platform: peersy.Platform

    content: peersy.Content[]

    forbidDisconnect: boolean

    constructor(platform: peersy.Platform, content: peersy.Content[]=[]) {
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

        this.forbidDisconnect = false

        peersy.connectedPeers.push(this)
    }

    async request(contentID: number) {
        let magnet = crypto.randomBytes(8).toString("base64url")

        peersy.emitter.emit("request", contentID, this, magnet)
    }

    async seed(contentID: number, index: number, magnet: string) {
        let content: peersy.Content | undefined
        this.content.forEach(thisContent => {
            if (thisContent.id === contentID) {
                content = thisContent

                return
            }
        })

        if (!content) {return}

        let piece: peersy.Piece | undefined
        content.pieces.forEach(thisPiece => {
            if (thisPiece.index === index) {
                piece = thisPiece

                return
            }
        })

        if (!piece) {return}

        // unfinished!

        peersy.emitter.emit(`${magnet}:seed`)
    }
}