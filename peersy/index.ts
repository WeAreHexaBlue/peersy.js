import * as events from "node:events"

var emitter = new events.EventEmitter()

interface Share {
    sharedAt: Date,
    sharedBy: Peer[]
}

interface Media {}

interface Post {
    title?: string,
    content?: string,
    attachments?: Media[],
    comments?: Comment[],
    author: User
}

interface Profile {
    display: string,
    avatar?: Media,
    banner?: Media,
    bio?: string,
    pronouns?: string[],
    user: User
}

interface User {
    username: string
}

class Peer {
    user: User
    origin: string
    status: string

    constructor(user: User, origin: string) {
        this.user = user
        this.origin = origin
        this.status = "CREATED"
    }

    connect() {
        this.status = "CONNECTED"
        emitter.emit("connect", this.user.username, this.origin, this.status)
    }

    async send(packet: Packet) {}
}

class Packet {
    id: number
    lastShare: Share
    createdAt: Date
    editedAt: Date
    content: Profile | Post | Media // to expand in the future

    constructor() {}
}