const InteractionPaginator = require("./InteractionPaginator");
const assert = require("assert");

const { Constants, Utils } = require('detritus-client')
const { Components } = Utils
const { InteractionCallbackTypes } = Constants

const allowedEvents = new Set([
  "MESSAGE_CREATE"
]);

const ButtonEmoji = Object.freeze({
  NEXT: '<:right:977871577758707782>',
  PREVIOUS: '<:left:977871577532211200>',
  STOP: '<:ico_trash:929498022386221096>',
  SEARCH: '<:search:1063080546365866056>',
  UNKNOWN: '<:ico_question:949420315677691934>'
})

const { hasOwnProperty } = Object.prototype;

const instances = new WeakSet();

module.exports = class Paginator {
  constructor(client, data = {}) {
    if (instances.has(client)) {
      throw "Only attach one pagination client"
    }

    assert.ok(hasOwnProperty.call(client, "gateway"), "Provided `client` has no `gateway` property. Use PaginationCluster.");

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
        if (!(listener instanceof InteractionPaginator)) continue;
        if (!listener.commandMessage) continue;

        if (event === "MESSAGE_CREATE" &&
          listener.isInChannel(data.channel_id) &&
          listener.isTarget(data.user_id) &&
          listener.waitingForPage) {
          await this.handleMessageEvent(data, listener);
        }
      }
    });
  }

  async handleButtonEvent(context) {
    let listener;
    for (const l of this.activeListeners) {
      if (!(l instanceof InteractionPaginator)) continue;
      if (!l.commandMessage) continue;
      if (l.isCommandMessage(context.message.id)) {
        listener = l
      }
    }

    // If person that interacted isnt the target, send a generic ping response and ignore it
    if (!listener.isTarget(context.user.id)) {
      await context.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE)
      return;
    }

    // Respond
    switch (context.customId) {
      case "next":
        await context.respond(InteractionCallbackTypes.UPDATE_MESSAGE, await listener.getNext())
        break;
      case "previous":
        await context.respond(InteractionCallbackTypes.UPDATE_MESSAGE, await listener.getPrevious())
        break;
      case "stop":
        await context.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE)
        listener.stop();
        break;
      default:
        // Emit the button as an event
        listener.emit("interaction", { context, listener });
        break;
    }
    
    return;
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

    for(const b of this.buttons){
      // If an object is provided, build button from that
      if(typeof b == "object") {
        components.createButton(Object.assign({
          customId: "custom",
          disabled: 0,
          style: 2,
          emoji: ButtonEmoji.UNKNOWN
        }, b));
      } else {
        components.createButton({
          customId: b,
          disabled: 0,
          style: 2,
          emoji: ButtonEmoji[b.toUpperCase()]
        });
      }
    }

    return components;
  }

  async createPaginator(data) {
    if (this.pageNumber && Array.isArray(data.pages)) {
      for (let i = 0; i < data.pages.length; ++i) {
        const element = data.pages[i];
      }
    }

    // Check if a paginator exists, if it does kill the old one
    let listener;
    for (const l of this.activeListeners) {
      if (!(l instanceof InteractionPaginator)) continue;
      if (!l.commandMessage) continue;

      if (l.isCommandMessage(data.context.message.id)) {
        listener = l
      }
    }
    if(listener) await listener.stop()

    // No need for a paginator if we only have one page.
    if(data.pages.length == 1){
      data.buttons = data.buttons.filter((i)=>!["next","previous"].includes(i))
    }

    const instance = new InteractionPaginator(this, data);
    this.activeListeners.push(instance);

    setTimeout(() => {
      instance.stop(true);
    }, data.maxTime || this.maxTime);

    // Edit below to change default button set
    this.buttons = typeof data.buttons !== "object" ? ["previous", "next"] : data.buttons;

    if (instance.commandMessage === null && data.pages) {
      await instance.init();
    }

    return instance;
  }
};
