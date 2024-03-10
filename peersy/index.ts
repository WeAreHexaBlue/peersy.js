import * as events from "node:events"
import { Peer } from "./peer"

export var emitter = new events.EventEmitter()

export var connectedPeers: Peer[] = []

export enum Platform {web, lnx, win, and, ios}

export function keyStrip(key: string, type: "PUBLIC" | "PRIVATE"): string {
    const keyLines = key.split("\n")

    const begin = keyLines.indexOf(`-----BEGIN ${type} KEY-----`) + 1
    const end = keyLines.indexOf(`-----END ${type} KEY-----`)

    return keyLines.slice(begin, end).join("\n")
}

export { Peer } from "./peer"