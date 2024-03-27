import { Peer } from "./peer"
import { CannotDisconnect } from "./errors"
import * as events from "node:events"
import * as crypto from "crypto"

export var connectedPeers: Peer[] = []

export var emitter: events.EventEmitter = new events.EventEmitter()

export enum Platform {web, lnx, win, and, ios}

export interface Content {
    id: number,
    length: number,
    pieces: Piece[]
}

export interface Piece {
    index: string,
    data: string
}

export interface IndexesToPeers {
    [index: number]: Peer[]
}

export interface ExitStatus {
    code: number,
    message: string
}

export function disconnectPeer(peer: Peer) {
    if (peer.forbidDisconnect) {
        throw CannotDisconnect
    }

    let peerAt = connectedPeers.findIndex(thisPeer => thisPeer === peer)
    connectedPeers.splice(peerAt, 1)
}

export async function findPeers(contentID: number): Promise<{itp: IndexesToPeers, exitStatus: ExitStatus}> {
    let itp: IndexesToPeers = {}

    let expectedLength: number = 0

    connectedPeers.forEach(peer => {
        peer.content.forEach(content => {
            if (content.id === contentID) {
                if (!expectedLength) {
                    expectedLength = content.length
                }

                content.pieces.forEach(piece => {
                    itp[piece.index].push(peer)
                })
            }
        })
    })

    let foundPieces: number[] = []
    Object.keys(itp).forEach(index => {
        foundPieces.push(Number(index))
    })

    let exitStatus: ExitStatus
    if (foundPieces.length === expectedLength) {
        exitStatus = {code: 0, message: "Success."}
    } else {
        exitStatus = {code: 1, message: "Content only partially found."}
    }

    return {itp, exitStatus}
}

export { Peer } from "./peer"
export { AlreadyDecrypted } from "./errors"