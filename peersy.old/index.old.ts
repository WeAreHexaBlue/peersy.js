import * as events from "node:events"
import { Packet } from "./packet.old"

export var emitter = new events.EventEmitter()

export var latestIDs: {[key: string]: number} = {
    post: 0,
    profile: 0,
    media: 0,
    packet: 0
}

export var unwantedStorageProperties: Array<string> = []

export type Content = {id: number, length: number} & (Post | Profile | Comment | Media) // to be expanded
export enum Platform {web, lnx, win, and, ios} // not sure if i have to separate Linux/Windows and Android/iOS

export interface Media {
    format: string,
    bytes: Buffer,
    author: User
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
    display?: string,
    avatar?: Media,
    banner?: Media,
    bio?: string,
    pronouns?: string[],
    author: User
}

export interface User {
    username: string
}

// lily can u make this pls :3
function makeContentFromPackets(contentoid: {[property: string]: Packet[]}) {}

export { Peer } from "./peer.old"
export { Packet } from "./packet.old"