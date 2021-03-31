<script lang="ts">
    import {login, logout, session} from '~/session'
    import {post} from '~/contract'

    let text = ''
    let sending = false
    let error: Error | null = null

    function handleSubmit(event: Event) {
        event.preventDefault()
        sending = true
        error = null
        post($session.value!, text)
            .then(() => {
                text = ''
            })
            .catch((e) => {
                error = e
            })
            .finally(() => {
                sending = false
            })
    }
</script>

<style lang="scss">
    form {
        display: flex;
        input[type='text'] {
            flex-grow: 1;
        }
        width: 100%;
        padding-left: 1ch;
    }
    .post {
        display: flex;
        align-items: center;
        border-top: 0.2em solid var(--primary-color);
        position: fixed;
        bottom: 0;
        left: 0;
        background: floralwhite;
        width: 100%;
        padding: 1ch;
        padding-left: var(--gutter-width);
    }
    .post,
    .spacer {
        height: 3em;
    }
</style>

<div class="spacer" />

<div class="post">
    {#if $session.value}
        {#if sending}
            <p>Sending your message...</p>
        {:else}
            <form on:submit={handleSubmit}>
                <input type="text" placeholder="Say something" bind:value={text} />
                <input type="submit" value="Send" />
                <button on:click={logout}>Log out</button>
                {#if error}
                    <p>Unable to send: <b>{error}</b></p>
                {/if}
            </form>
        {/if}
    {:else}
        <div class="info" />
        <div class="body">
            <button on:click={login}>Login</button>
            to join the conversation
        </div>
    {/if}
</div>
