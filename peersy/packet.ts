import * as crypto from "crypto"

export class Packet {
    index: number
    content: string

    constructor(index: number, content: string) {
        this.index = index
        this.content = content
    }
}