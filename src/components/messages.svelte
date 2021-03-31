<script lang="ts">
    import type {TimePoint} from 'anchor-link'
    import {format} from 'fecha'

    import type {SomeMessage} from '~/contract'
    import {currentUser} from '~/session'

    export let messages: SomeMessage[]

    function formatTime(time: TimePoint) {
        return format(time.toDate(), 'YYYY-MM-DD HH:mm:ss')
    }
</script>

<style lang="scss">
    @import '../style/global.scss';

    .message {
        display: flex;
        line-height: 1.2;
        @media (max-width: $mobile-fold) {
            flex-direction: column;
            margin-bottom: 1em;
        }
    }
    .text {
        flex-grow: 1;
        .pending & {
            color: var(--secondary-text);
        }
    }
    .timestamp,
    .author {
        white-space: nowrap;
        color: var(--secondary-text);
    }
    .timestamp {
        order: 3;
        @media (max-width: $mobile-fold) {
            position: absolute;
            right: 1ch;
            order: 0;
        }
    }
    .author {
        width: var(--gutter-width);
        min-width: var(--gutter-width);
        margin-right: 1ch;
        text-align: right;
        .own & {
            color: var(--primary-color);
        }
        @media (max-width: $mobile-fold) {
            text-align: left;
        }
    }
</style>

{#each messages as message}
    <div
        class="message"
        class:pending={message.id === undefined}
        class:own={$currentUser?.actor.equals(message.author)}
    >
        <div class="author">{message.author}</div>
        <div class="timestamp">
            {#if message.timestamp}
                {formatTime(message.timestamp)}
            {/if}
        </div>
        <div class="text">{message.text}</div>
    </div>
{:else}
    <p>No messages yet, write something.</p>
{/each}
