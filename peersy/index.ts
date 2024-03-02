import * as events from "node:events"

export var emitter = new events.EventEmitter()

export var latestIDs: {[key: string]: number | null} = {
    post: null,
    profile: null,
    media: null
}

export type Content = Post | Profile | Media // to be expanded

export interface Media {
    id: number
}

export interface Post {
    id: number
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