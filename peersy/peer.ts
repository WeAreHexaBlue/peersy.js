import * as peersy from "./index"

export class Peer {
    user: peersy.User
    client: peersy.Platform
    packets: peersy.Packet[]

    constructor(user: peersy.User, client: peersy.Platform) {
        this.user = user
        this.client = client
        this.packets = []

        this._findLocalPackets()

        peersy.emitter.on("packet", async (packet: peersy.Packet, recipient?: peersy.Peer) => {
            if (recipient && recipient !== this) {return}

            await this._getPacket(packet)
        })

        peersy.emitter.on("request", async (content: peersy.Content, requester: peersy.Peer) => {
            this.packets.forEach(async packet => {
                if (packet.partOf.id === content.id) {
                    await this.sendTo(packet, requester)
                } 
            })
        })
    }

    connect() {
        peersy.emitter.emit("connect", this.user.username, this.client, this.packets)
    }

    async sendTo(packet: peersy.Packet, recipient: peersy.Peer) {
        peersy.emitter.emit("packet", packet, recipient)
    }

    async send(packet: peersy.Packet) {
        peersy.emitter.emit("packet", packet)
    }

    async request(content: peersy.Content) {
        peersy.emitter.emit("request", content, this)
    }

    _findLocalPackets() { // to run inside constructor
        switch (this.client) {
            case "web":
                for (let i = 0; i < localStorage.length; i++) {
                    this.packets.push(localStorage[String(localStorage.key(i))])
                }
            // other cases to be added later
        }
    }

    async _getPacket(packet: peersy.Packet) {
        switch (this.client) {
            case "web":
                let content = localStorage.getItem(`${packet.partOf}`)

                let newContent: {[key: number]: string} = !content ? {} : content // if content is null, set newContent to {}, else to content

                newContent[packet.id] = packet.content
                localStorage.setItem(`${packet.partOf}`, JSON.stringify(newContent))
            // other cases to be added later
        }

        this.packets.push(packet)
    }
}