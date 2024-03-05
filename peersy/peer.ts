import * as peersy from "./index"
import * as crypto from "crypto"

export class Peer {
    user: peersy.User
    client: peersy.Platform
    packets: peersy.Packet[]
    publicKey: string
    #privateKey: string

    awaitingPacketAnyoneResponse: boolean

    constructor(user: peersy.User, client: peersy.Platform) {
        this.user = user
        this.client = client
        this.packets = []

        this.#findLocalPackets()

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
            this.packets.forEach(async packet => {
                if (packet.partOf.id === content.id) {
                    packet.recipient = requester
                    await this.send(packet)
                } 
            })
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

    #findLocalPackets() { // to run inside constructor
        switch (this.client) {
            case "web":
                for (let i = 0; i < localStorage.length; i++) {
                    this.packets.push(localStorage[String(localStorage.key(i))])
                }
            // other cases to be added later
        }
    }

    async #getPacket(packet: peersy.Packet) {
        switch (this.client) {
            case "web":
                let content = localStorage.getItem(`${packet.partOf}`)
                let newContent: [peersy.Packet] = !content ? {} : JSON.parse(content) // if content is null, set newContent to {}, else to content

                let currentPacket = newContent[packet.index]

                if (!packet.encContent) {return}

                currentPacket.content = crypto.privateDecrypt(this.#privateKey, packet.encContent).toString("utf8")
                currentPacket.encContent = undefined
                this.packets.push(currentPacket)
        }
    }
}