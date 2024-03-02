import * as peersy from "./index"

export class Peer {
    user: peersy.User
    origin: string
    status: string

    constructor(user: peersy.User, origin: string) {
        this.user = user
        this.origin = origin
        this.status = "CREATED"
    }

    connect() {
        this.status = "CONNECTED"
        peersy.emitter.emit("connect", this.user.username, this.origin, this.status)
    }

    async send(packet: peersy.Packet) {}
}