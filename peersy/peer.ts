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

        this.publicKey = peersy.keyStrip(publicKey, "PUBLIC")
        this.#privateKey = peersy.keyStrip(privateKey, "PRIVATE")

        this.#getLocalContent()

        peersy.connectedPeers.push(this)

        this.emitter.on("req", async (requester: peersy.Peer, contentID: number, magnet: string) => {
            let wanted: peersy.Content
            this.content.forEach(content => {
                if (content.id === contentID) {
                    wanted = content
                    return
                }
            })

            this.emitter.emit(`${magnet}:found`)
        })
    }

    async request(contentID: number) {
        if (contentID in peersy.blacklist) {
            throw peersy.BlacklistedContent
        }

        let magnet = crypto.randomBytes(8).toString("hex")
        this.emitter.on(`${magnet}:found`, (packet) => {})

        this.emitter.emit("req", this, contentID, magnet)
    }

    #getLocalContent() {
        let localContent = localStorage.getItem("content")

        this.content = localContent ? JSON.parse(localContent) : [] // if localContent exists, this.content becomes the JSON parsed from localStorage's "content" property, else an empty array
    }
}