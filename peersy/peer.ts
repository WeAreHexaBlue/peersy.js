import * as peersy from "./index"
import * as events from "node:events"
import * as crypto from "crypto"

export class Peer {
    emitter: events.EventEmitter

    publicKey: string
    #privateKey: string

    platform: peersy.Platform

    content: peersy.Content[]
    partialContent: peersy.PartialContent[]

    constructor(platform: peersy.Platform) {
        this.emitter = new events.EventEmitter()

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

        this.#getLocalContent()

        peersy.connectedPeers.push(this)

        this.emitter.on("req", async (requester: peersy.Peer, contentID: number, magnet: string) => {
            let wanted: peersy.Content | undefined
            this.content.forEach(content => {
                if (content.id === contentID) {
                    wanted = content
                    return
                }
            })
            if (!wanted) {return}

            let encryptedContent: string = crypto.publicEncrypt(requester.publicKey, Buffer.from(wanted.data)).toString("base64url")
            let contentChunks = encryptedContent.match(/.{1,40}/g)

            if (!contentChunks) {return}

            this.emitter.emit(`${magnet}:info`, contentChunks.length)

            let packets: peersy.Packet[] = []
            contentChunks.forEach((chunk, index) => {
                let packet = new peersy.Packet(index, chunk)
                packets.push(packet)
            })

            packets.forEach(packet => {
                this.emitter.emit(`${magnet}:send`, packet)
            })

            this.emitter.once(`${magnet}:get`, () => {})
        })
    }

    async request(contentID: number) {
        if (contentID in peersy.blacklist) {
            throw peersy.BlacklistedContent
        }

        let magnet = crypto.randomBytes(8).toString("hex")

        this.emitter.once(`${magnet}:info`, (length: number) => {
            this.partialContent.push({
                id: contentID,
                length: length,
                packets: []
            })
        })

        this.emitter.on(`${magnet}:send`, (packet: peersy.Packet) => {
            let contentAt = this.partialContent.findIndex(partialContent => {partialContent.id === contentID})

            this.partialContent[contentAt].packets.push(packet)

            if (this.partialContent[contentAt].packets.length === this.partialContent[contentAt].length) {
                this.emitter.removeAllListeners(`${magnet}:send`)

                let data: string

                let decryptedPackets: peersy.Packet[] = []
                this.partialContent[contentAt].packets.forEach((packet, index) => {
                    packet.content = crypto.privateDecrypt(this.#privateKey, Buffer.from(packet.content, "base64url")).toString()
                    decryptedPackets[index] = packet
                })

                data = decryptedPackets.join("")

                this.content.push({
                    id: contentID,
                    data: data
                })

                this.partialContent.splice(contentAt, 1)

                this.emitter.emit(`${magnet}:get`)
            }
        })

        this.emitter.emit("req", this, contentID, magnet)
    }

    #getLocalContent() {
        let localContent = localStorage.getItem("content")

        this.content = localContent ? JSON.parse(localContent) : [] // if localContent exists, this.content becomes the JSON parsed from localStorage's "content" property, else an empty array
    }
}