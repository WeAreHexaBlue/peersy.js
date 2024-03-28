# peersy.js
Node.js interface for the **peersy Content Sharing Protocol (pCSP)** created by **HexaBlue**.

## Examples
Setting up **seeding**:
```ts
// WARNING: IT IS WAY TOO EARLY TO TRUST THIS CODE, I DON'T KNOW WHAT I'M DOING!

import * as peersy from "peersy"

const localContent = ... // find locally stored content somehow (if peer has never connected before, make sure this ends up being an empty array)

const peer = new peersy.Peer(peersy.Platform.web, localContent) // new peer connected from a browser (platform is "web")

peersy.emitter.on("request", async (contentID: number, requester: peersy.Peer, magnet: string) => {
    // RECOMMENDED: check against a list of blacklisted content IDs to forbid propagation of content you deem unsafe (this is the equivalent to deleting a post on a classic social network with a server)

    let {itp, length, exitStatus} = await peersy.findSeeds(contentID)

    Object.keys(itp).forEach(async index => {
        let peer = itp[Number(index)][Math.floor(Math.random() * itp[Number(index)].length)] // please don't do this

        await peer.seed(contentID, Number(index), requester, magnet)
    })
})
```