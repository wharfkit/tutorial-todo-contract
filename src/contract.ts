import {AnyAction, LinkSession, Name, TimePoint, UInt64} from 'anchor-link'
import {writable as writableResult} from 'svelte-result-store'
import {writable} from 'svelte/store'

import * as types from './contract-types'
import {link} from './session'
import {contract} from './config'

export interface SomeMessage {
    id?: UInt64
    author: Name
    text: string
    timestamp?: TimePoint
}

export async function post(session: LinkSession, text: string) {
    const data = types.Post.from({
        author: session.auth.actor,
        text,
    })
    const action: AnyAction = {
        account: contract,
        name: 'post',
        authorization: [session.auth],
        data,
    }
    pendingMessages.update((pending) => pending.concat(data))
    try {
        await session.transact({action})
    } catch (error) {
        pendingMessages.update((pending) => pending.filter((v) => v !== data))
    }
}

async function loadMessages(lowerBound: UInt64) {
    let response = await link.client.v1.chain.get_table_rows({
        code: contract,
        table: 'messages',
        type: types.MessageRow,
        limit: 100,
        lower_bound: lowerBound,
        key_type: 'i64',
        index_position: 'primary',
    })
    return response
}

export const pendingMessages = writable<types.Post[]>([])

export const messages = writableResult<types.MessageRow[]>((set, error) => {
    let headId = UInt64.from(0)
    let messages: types.MessageRow[] = []
    let timer: any
    var running = true
    const load = () => {
        loadMessages(headId)
            .then(({rows}) => {
                if (rows.length > 0) {
                    pendingMessages.update((pending) =>
                        pending.filter(
                            (post) =>
                                !rows.some(
                                    (row) =>
                                        row.author.equals(post.author) && row.text === post.text
                                )
                        )
                    )
                    messages = messages.concat(rows)
                    headId = UInt64.from(messages[messages.length - 1].id.toNumber() + 1)
                    set(messages)
                }
            })
            .catch(error)
            .finally(() => {
                if (running) {
                    timer = setTimeout(load, 5000)
                }
            })
    }
    load()
    return () => {
        running = false
        clearInterval(timer)
    }
})
