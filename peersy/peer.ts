import * as peersy from "./index"
import * as crypto from "crypto"

export class Peer {
    user: peersy.User
    client: peersy.Platform
    contentoids: {[id: number]: {[property: string]: peersy.Packet[]}}
    publicKey: string
    #privateKey: string

    awaitingPacketAnyoneResponse: boolean

    constructor(user: peersy.User, client: peersy.Platform) {
        this.user = user
        this.client = client
        this.contentoids = []

        this.#findLocalContentoids()

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

        this.awaitingPacketAnyoneResponse = false

        peersy.emitter.on("packet", async (packet: peersy.Packet) => {
            if (!packet.recipient || packet.recipient !== this) {return}

            await this.#getPacket(packet)
        })

        peersy.emitter.on("packetAnyone", async (packet: peersy.Packet) => {
            peersy.emitter.emit("packetMe", packet, this)
        })

        peersy.emitter.on("packetMe", async (packet: peersy.Packet, requester: peersy.Peer) => {
            if (this.awaitingPacketAnyoneResponse && packet.sender == this) {
                packet.recipient = requester
                packet.encrypt()

                await this.send(packet)
            }
        })

        peersy.emitter.on("request", async (content: peersy.Content, requester: peersy.Peer) => {
            for (let [contentoid, value] of Object.entries(this.contentoids)) {
                if (Number(contentoid) !== content.id) {continue}

                for (let [property, packets] of Object.entries(value)) {
                    packets.forEach(async packet => {
                        packet.recipient = requester
                        packet.encrypt()
                        await this.send(packet)
                    })
                }
            }
        })
    }

    async send(packet: peersy.Packet) {
        peersy.emitter.emit("packet", packet)
    }

    async sendAnyone(packet: peersy.Packet) {
        peersy.emitter.emit("packetAnyone", packet)
        this.awaitingPacketAnyoneResponse = true
    }

    async request(content: peersy.Content) {
        peersy.emitter.emit("request", content, this)
    }

    #findLocalContentoids() { // to run inside constructor
        switch (this.client) {
            case peersy.Platform.web:
                for (let key in localStorage) {
                    if (peersy.unwantedStorageProperties.includes(key)) {continue}

                    this.contentoids[key] = localStorage[key]
                }
            // other cases to be added later
        }
    }

    async #getPacket(packet: peersy.Packet) {
        switch (this.client) {
            case peersy.Platform.web:
                let content = localStorage.getItem(`${packet.partOf}`)
                let newContent: [peersy.Packet] = !content ? {} : JSON.parse(content) // if content is null, set newContent to {}, else to content

                let currentPacket = newContent[packet.index.property][packet.index.index]

                if (!packet.encContent) {return}

                packet.decrypt(this.#privateKey)

                this.contentoids[packet.partOf.id][packet.index.property].push(packet)
        }
    }
}