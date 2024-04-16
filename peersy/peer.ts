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

    async request(contentID: string) {
        let magnet = crypto.randomBytes(8).toString("base64url")

        this.forbidDisconnect = true

        peersy.emitter.on(`${magnet}:seed`, async (piece: peersy.Piece) => {
            if (piece.data) {return}

            piece.data = crypto.privateDecrypt(this.#privateKey, Buffer.from(piece.enc, "base64url")).toString("utf8")
            piece.enc = ""

            this.content[piece.partOf].pieces.push(piece)

            if (this.content[piece.partOf].pieces.length === this.content[piece.partOf].length) {
                peersy.emitter.removeAllListeners(`${magnet}:seed`)
                this.forbidDisconnect = false
            }
        })

        peersy.emitter.emit("request", contentID, this, magnet)
    }

    async upload(content: peersy.Content) {
        let magnet = crypto.randomBytes(8).toString("base64url")

        this.forbidDisconnect = true

        peersy.emitter.once(`${magnet}:leech`, async (requester: peersy.Peer) => {
            content.pieces.forEach(async piece => {
                piece = peersy.encrypt(piece, requester)

                await this.seed(content.id, piece.index, requester, magnet)
            })
        })

        peersy.emitter.emit("upload", content.id, content.length, magnet)
    }

    async seed(contentID: string, index: number, to: peersy.Peer, magnet: string) {
        this.forbidDisconnect = true

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

        if (piece.enc) {return}

        piece = peersy.encrypt(piece, to)

        peersy.emitter.emit(`${magnet}:seed`, piece)

        this.forbidDisconnect = false
    }

    createContent(contentID: string, expectedLength: number) {
        this.content.push({
            id: contentID,
            length: expectedLength,
            pieces: []
        })
    }
}