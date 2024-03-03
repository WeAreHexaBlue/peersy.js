import * as peersy from "./index"

export class Peer {
    user: peersy.User
    origin: string
    status: string
    client: "web" | "linux" | "windows" | "android" | "ios" // not sure if i have to separate Linux/Windows and Android/iOS

    constructor(user: peersy.User, origin: string) {
        this.user = user
        this.origin = origin
        this.status = "CREATED"

        peersy.emitter.on("packet", async (packet: peersy.Packet, recipient?: peersy.Peer) => {
            if (recipient && recipient !== this) {return}

            await this._getPacket(packet)
        })
    }

    connect() {
        this.status = "CONNECTED"
        peersy.emitter.emit("connect", this.user.username, this.origin, this.status)
    }

    async sendTo(packet: peersy.Packet, recipient: peersy.Peer) {
        peersy.emitter.emit("packet", packet, recipient)
    }

    async send(packet: peersy.Packet) {
        peersy.emitter.emit("packet", packet)
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
    }
}