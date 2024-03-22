import * as peersy from "./index"

export class BlacklistedContent extends Error {
    constructor(message: string="", contentID: number) {
        super(message)

        this.message = `Content \`${contentID}\` is blacklisted on this peersy network.`
    }
}

export class CannotDisconnect extends Error {
    constructor(message: string="") {
        super(message)

        this.message = "This peer may not disconnect yet."
    }
}

export class ChunkFailure extends Error {
    constructor(message: string="") {
        super(message)

        this.message = "Content data packetization failed. If you see this error, God is real and they hate my code."
    }
}