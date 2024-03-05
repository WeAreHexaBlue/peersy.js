import * as events from "node:events"
import { Packet } from "./packet"

export var emitter = new events.EventEmitter()

export var latestIDs: {[key: string]: number} = {
    post: 0,
    profile: 0,
    media: 0,
    packet: 0
}

export type Content = {id: number, length: number} & (Post | Profile | Comment | Media) // to be expanded
export type Platform = "web" | "lnx" | "win" | "and" | "ios" // not sure if i have to separate Linux/Windows and Android/iOS

export interface Media {
    format: string,
    bytes: Buffer
}

export interface Comment {
    content?: string,
    attachments?: Media[]
    author: User
}

export interface Post {
    title?: string,
    content?: string,
    attachments?: Media[],
    comments?: Comment[],
    author: User
}

export interface Profile {
    display: string,
    avatar?: Media,
    banner?: Media,
    bio?: string,
    pronouns?: string[],
    user: User
}

export interface User {
    username: string
}

// to be done later am tired now !!!!!!
function makeContentFromPackets(packets: Packet[]) {
    let content: Content
    let makingContent = {}
}

export { Peer } from "./peer"
export { Packet } from "./packet"