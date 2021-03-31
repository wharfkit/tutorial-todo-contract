<script lang="ts">
    import type {SomeMessage} from '~/contract'
    import {afterUpdate} from 'svelte/internal'
    import SendMessage from '~/components/send-message.svelte'
    import Messages from '~/components/messages.svelte'
    import {messages, pendingMessages} from '~/contract'

    let needsScroll = true
    afterUpdate(() => {
        if (needsScroll) {
            window.scrollTo(0, document.body.scrollHeight)
            needsScroll = false
        }
    })
    $: $messages.value && (needsScroll = true)
    $: allMessages = (($messages.value || []) as SomeMessage[]).concat($pendingMessages)
</script>

<style lang="scss" global>
    @import './style/global.scss';

    :root {
        --text: black;
        --secondary-text: gainsboro;
        --background-color: white;
        --primary-color: teal;
        --primary-color-text: white;
        --gutter-width: 14ch;
        @media (max-width: $mobile-fold) {
            --gutter-width: 1ch;
        }
    }

    * {
        box-sizing: border-box;
    }

    body {
        background-color: var(--background-color);
        color: var(--text);
        padding: 0;
        margin: 0;
    }

    html,
    button,
    input {
        font-family: Courier, monospace;
        font-size: 13px;
        line-height: 1;
    }

    button,
    input[type='submit'] {
        background-color: var(--primary-color);
        color: var(--primary-color-text);
        cursor: pointer;
        border: 0;
        padding: 0.2em 0.4em;
        &:hover {
            filter: brightness(1.5);
        }
    }

    input[type='text'] {
        border: 0;
        padding: 0.2em 0.4em;
    }
</style>

<main style="padding: 1em 0">
    {#if $messages.value}
        <Messages messages={allMessages} />
    {:else if $messages.error}
        {$messages.error}
    {:else}
        Loading...
    {/if}
    <SendMessage />
</main>
