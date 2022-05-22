const ReactionPaginator = require("./ReactionPaginator");
const assert = require("assert");

const { Constants, Utils } = require('detritus-client')
const { Components, ComponentActionRow } = Utils
const { InteractionCallbackTypes } = Constants

const allowedEvents = new Set([
    "MESSAGE_REACTION_ADD",
    "MESSAGE_CREATE"
]);

function deprecate(message) {
    console.warn(`[detritus-pagination] Deprecation warning: ${message}`);
}

const ButtonEmoji = Object.freeze({
    NEXT: '<:right:977871577758707782>',
    PREVIOUS: '<:left:977871577532211200>',
    STOP: '<:ico_trash:929498022386221096>'
})

const { hasOwnProperty } = Object.prototype;

// Keep track of created instances in a WeakSet to prevent memory leaks
// We do this to notify the user when a Paginator is attached to the same client
const instances = new WeakSet();

module.exports = class Paginator {
    constructor(client, data = {}) {
        if (instances.has(client)) {
            deprecate("Avoid attaching multiple Paginators to the same client, as it can lead to memory leaks");
        } else {
            instances.add(client);
        }

        assert.ok(
            hasOwnProperty.call(client, "gateway"),
            "Provided `client` has no `gateway` property. Consider using `require('detritus-pagination').PaginatorCluster` if you're using CommandClient."
        );

        this.client = client;
        this.maxTime = data.maxTime || 300000;
        this.pageLoop = typeof data.pageLoop !== "boolean" ? false : data.pageLoop;
        this.pageNumber = typeof data.pageNumber !== "boolean" ? false : data.pageNumber;
        this.activeListeners = [];

        this.client.gateway.on("packet", async packet => {
            const {
                d: data,
                t: event
            } = packet;
            if (!data) return;
            if (!allowedEvents.has(event)) return;

            for (const listener of this.activeListeners) {
                if (!(listener instanceof ReactionPaginator)) continue;
                if (!listener.commandMessage) continue;

                if (listener.isCommandMessage(data.message_id) &&
                    listener.isTarget(data.user_id)) {
                    await this.handleReactionEvent(data, listener);
                } else if (event === "MESSAGE_CREATE" &&
                    listener.isInChannel(data.channel_id) &&
                    listener.isTarget(data.user_id) &&
                    listener.waitingForPage) {
                    await this.handleMessageEvent(data, listener);
                }
            }
        });
    }

    async handleButtonEvent(context) {
        // Get listener
        let listener;
        for (const l of this.activeListeners) {
            if (!(l instanceof ReactionPaginator)) continue;
            if (!l.commandMessage) continue;

            if (l.isCommandMessage(context.message.id)) {
                listener = l
            }
        }

        if(!listener.isTarget(context.user.id)) {
            await context.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE)
            return;
        }

        switch (context.customId) {
            case "next":
                //await context.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE)
                //listener.next();
                await context.respond(InteractionCallbackTypes.UPDATE_MESSAGE, await listener.getNext())
                break;
            case "previous":
                await context.respond(InteractionCallbackTypes.UPDATE_MESSAGE, await listener.getPrevious())
                break;
            case "stop":
                await context.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE)
                listener.stop();
                break;
        }
    }

    // TODO: Clean up legacy code from ReactionPaginator

    // Legacy
    async handleReactionEvent(data, listener) {
        switch (data.emoji.name) {
            case listener.reactions.nextPage:
                listener.next();
                break;
            case listener.reactions.previousPage:
                listener.previous();
                break;
            case listener.reactions.firstPage:
                listener.jumpTo(0);
                break;
            case listener.reactions.lastPage:
                listener.jumpTo(listener.pages.length - 1);
                break;
            case listener.reactions.stop:
                listener.stop();
                break;
            case listener.reactions.skipTo:
                if (listener.waitingForPage) return;
                listener.waitingForPage = await this.client.rest.createMessage(data.channel_id, "What page do you want to go to?");
                break;
            default:
                if (!Object.values(listener.reactions).includes(data.emoji.name)) return;
        }

        listener.emit("raw", data);
        listener.clearReaction(data.emoji.name);
    }

    async handleMessageEvent(data, listener) {
        const page = parseInt(data.content, 10);
        if (isNaN(page)) {
            return;
        }

        listener.jumpTo(page - 1)
            .then(async () => {
                try {
                    await listener.waitingForPage.delete();
                    await this.client.rest.deleteMessage(data.channel_id, data.id);
                } catch (e) { }

                listener.waitingForPage = null;
            }).catch(() => { });
    }

    async components(listener) {
        const components = new Components({
            timeout: this.expires,
            run: this.handleButtonEvent.bind(this),
        });

        components.createButton({
            customId: "previous",
            disabled: 0,
            style: 2,
            emoji: ButtonEmoji.PREVIOUS
        });
        components.createButton({
            customId: "next",
            disabled: 0,
            style: 2,
            emoji: ButtonEmoji.NEXT
        });

        //components.createButton({
        //    customId: "stop",
        //    disabled: 0,
        //    style: 2,
        //    emoji: ButtonEmoji.STOP
        //});
        return components;
    }

    async createReactionPaginator(data) {
        if (this.pageNumber && Array.isArray(data.pages)) {
            for (let i = 0; i < data.pages.length; ++i) {
                const element = data.pages[i];

            }
        }

        const instance = new ReactionPaginator(this, data);
        this.activeListeners.push(instance);

        setTimeout(() => {
            instance.stop(true);
        }, data.maxTime || this.maxTime);

        if (instance.commandMessage === null && data.pages) {
            await instance.init();
        }

        //await instance.addReactions();
        return instance;
    }
};
