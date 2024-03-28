export class CannotDisconnect extends Error {
    constructor(message: string="") {
        super(message)

        this.message = "This peer may not disconnect yet."
    }
}

export class ChunkFailure extends Error {
    constructor(message: string="") {
        super(message)

        this.message = "Chunkization failure. An empty data string may have been provided; check your trash code."
    }
}