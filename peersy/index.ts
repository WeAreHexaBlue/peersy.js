import * as events from "node:events"

export var emitter = new events.EventEmitter()

export var latestIDs: {[key: string]: number} = {
    post: 0,
    profile: 0,
    media: 0,
    packet: 0
}

export type Content = {id: number} & (Post | Profile | Media) // to be expanded
export type Platform = "web" | "linux" | "windows" | "android" | "ios" // not sure if i have to separate Linux/Windows and Android/iOS

export interface Media {}

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

export { Peer } from "./peer"
export { Packet } from "./packet"