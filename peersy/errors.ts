export class CannotDisconnect extends Error {
    constructor(message: string="") {
        super(message)

        this.message = "This peer may not disconnect yet."
    }
}

export class AlreadyDecrypted extends Error {
    constructor(message: string="") {
        super(message)

        this.message = "This content has already been decrypted."
    }
}