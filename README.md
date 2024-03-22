# peersy.js
Node.js interface for the peersy Content Sharing Protocol (pCSP) created by HexaBlue.

## Examples
Setting up **seeding**:
```ts
import * as peersy from "peersy"

const localContent = ... // find locally stored content somehow
const localPartialContent = ... // find locally stored partial content somehow

const peer = new peersy.Peer(peersy.Platform.web, localContent, localPartialContent) // new peer connected from a browser (platform is "web")

peersy.emitter.on("request", (contentID: string, requester: peersy.Peer, magnet: string) => {
    // obtain the request's data [DOCUMENTAION TO BE FINISHED]
})
```