import { Peer } from "./peer"
import * as errors from "./errors"
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
    index: number,
    data: string,
    enc: string,
    partOf: number // Content ID
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
        throw errors.CannotDisconnect
    }

    let peerAt = connectedPeers.findIndex(thisPeer => thisPeer === peer)
    connectedPeers.splice(peerAt, 1)
}

export function makeContent(data: string, highestID: number): Content {
    let chunks = data.match(/.{1,40}/g)

    if (!chunks) {throw errors.ChunkFailure}

    let pieces: Piece[] = []
    chunks.forEach((chunk, index) => {
        pieces.push({
            index: index,
            data: chunk,
            enc: "",
            partOf: highestID + 1
        })
    })

    let content: Content = {
        id: highestID + 1,
        length: pieces.length,
        pieces: pieces
    }

    return content
}

export function encrypt(piece: Piece, to: Peer): Piece {
    piece.enc = crypto.publicEncrypt(to.publicKey, Buffer.from(piece.data)).toString("base64url")
    piece.data = ""

    return piece
}

export async function findSeeds(contentID: number): Promise<{itp: IndexesToPeers, expectedLength: number, exitStatus: ExitStatus}> {
    let itp: IndexesToPeers = {}

    let expectedLength: number = 0

    connectedPeers.forEach(peer => {
        peer.content.forEach(content => {
            if (content.id === contentID) {
                if (!expectedLength) {
                    expectedLength = content.length
                }

                content.pieces.forEach(piece => {
                    if (!piece.enc) {
                        itp[piece.index].push(peer)
                    }
                })

                return
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

    return {itp, expectedLength, exitStatus}
}

export { Peer } from "./peer"
export * as errors from "./errors"