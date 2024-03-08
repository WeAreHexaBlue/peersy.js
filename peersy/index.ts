import * as events from "node:events"

export var emitter = new events.EventEmitter()

export enum Status {req, give, con, down, up}
export enum Platform {web, lnx, win, and, ios}