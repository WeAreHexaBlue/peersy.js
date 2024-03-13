import { Peer } from "./peer"
import { Packet } from "./packet"

export var network: string = "" // name of the network (ex.: "dibsy.app")

export var connectedPeers: Peer[] = [] // array of currently connected peers
export var blacklist: number[] = [] // array of content IDs to stop propagating

export enum Platform {web, lnx, win, and, ios}

export interface Content {
    id: number,
    data: string
}

export interface PartialContent {
    id: number,
    length: number,
    packets: Packet[]
}

export { Peer } from "./peer"
export { Packet } from "./packet"
export { BlacklistedContent } from "./errors"