import * as peersy from "./index"

export class BlacklistedContent extends Error {
    constructor(message: string="", contentID: number) {
        super(message)

        this.message = `Content \`${contentID}\` is blacklisted on \`${peersy.network}\`.`
    }
}

export class CannotDisconnect extends Error {
    constructor(message: string="") {
        super(message)

        this.message = "This peer may not disconnect yet."
    }
}