import Link from 'anchor-link'
import BrowserTransport from 'anchor-link-browser-transport'

import {writable, derived} from 'svelte-result-store'
import {get} from 'svelte/store'

const contract = import.meta.env.SNOWPACK_PUBLIC_CONTRACT_ACCOUNT
const nodeUrl = import.meta.env.SNOWPACK_PUBLIC_NODE_URL
const chainId = import.meta.env.SNOWPACK_PUBLIC_CHAIN_ID

export const link = new Link({
    transport: new BrowserTransport(),
    service: 'https://buoy-ap.greymass.network',
    chains: [{chainId, nodeUrl}],
})

export const session = writable(() => link.restoreSession(contract))

export const currentUser = derived(session, ($session) => $session?.auth).value

export function login() {
    link.login(contract)
        .then((result) => {
            session.set({value: result.session})
        })
        .catch((error) => {
            session.set({error})
        })
}

export function logout() {
    let activeSession = get(session.value)
    if (activeSession) {
        activeSession
            .remove()
            .catch((error) => {
                console.warn('Error during logout', error)
            })
            .finally(() => {
                session.set({value: null})
            })
    }
}
