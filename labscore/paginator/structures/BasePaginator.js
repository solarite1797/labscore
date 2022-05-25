const EventEmitter = require("eventemitter3");
const { Context } = require("detritus-client/lib/command");

module.exports = class BasePaginator extends EventEmitter {
  constructor(client, data) {
    super();
    this.client = client;
    this.message = BasePaginator.asMessage(data.context);
    this.commandMessage = data.commandMessage || null;
    this.pages = data.pages;
    this.index = 0;
    this.targetUser = data.targetUser || this.message.author.id;

    // TODO: use editOrReply, kill old paginator if it exists
    this.editOrReply = data.context.editOrReply.bind(data.context);
  }

  static asMessage(ctx) {
    return ctx instanceof Context ? ctx.message : ctx;
  }

  get isShared() {
    return this.commandMessage instanceof Map;
  }

  isCommandMessage(messageId) {
    if (!this.commandMessage) return false;

    return this.isShared ? this.commandMessage.has(messageId) : this.commandMessage.id === messageId;
  }

  isInChannel(channelId) {
    if (!this.commandMessage) return false;

    return this.isShared ? Array.from(this.commandMessage.values()).some(x => x.channelId === channelId) : this.commandMessage.channelId === channelId;
  }

  isTarget(user) {
    return this.targetUser instanceof Set ? this.targetUser.has(user) : this.targetUser === user;
  }

  async update(data) {
    if (this.isShared) {
      for (const m of this.commandMessage.values()) {
        await m.edit(data);
      }
    } else if (this.commandMessage) {
      this.commandMessage.edit(data);
    }
  }

  async init() {
    // Create Components
    let msg = this.pages[this.index];
    msg.components = await this.client.components(this)
    if(!msg.message_reference) msg.reference = true
    if(!msg.allowedMentions) msg.allowedMentions = {parse: [], repliedUser: false}
    return this.commandMessage = await this.editOrReply(msg);
  }

  async previous() {
    if (Array.isArray(this.pages) && this.pages.length > 0) {
      if (this.client.pageLoop) {
        await this.update(this.pages[this.index === 0 ? this.index = this.pages.length - 1 : --this.index]);
      } else if (this.index !== 0) {
        await this.update(this.pages[--this.index]);
      } else {
        return this.commandMessage;
      }
    }
    this.emit("previous", this);
    return this.commandMessage;
  }

  async getPrevious() {
    if (Array.isArray(this.pages) && this.pages.length > 0) {
      if (this.client.pageLoop) {
        return this.pages[this.index === 0 ? this.index = this.pages.length - 1 : --this.index]
      } else if (this.index !== 0) {
        return this.pages[--this.index]
      } else {
        return this.commandMessage;
      }
    }
    this.emit("previous", this);
    return this.commandMessage;
  }

  async next() {
    if (Array.isArray(this.pages) && this.pages.length > 0) {
      if (this.client.pageLoop) {
        await this.update(this.pages[this.index === this.pages.length - 1 ? this.index = 0 : ++this.index]);
      } else if (this.index !== this.pages.length - 1) {
        await this.update(this.pages[++this.index]);
      } else {
        return this.commandMessage;
      }
    }
    this.emit("next", this);
    return this.commandMessage;
  }

  async getNext() {
    if (Array.isArray(this.pages) && this.pages.length > 0) {
      if (this.client.pageLoop) {
        return this.pages[this.index === this.pages.length - 1 ? this.index = 0 : ++this.index]
      } else if (this.index !== this.pages.length - 1) {
        return this.pages[++this.index]
      } else {
        return this.commandMessage;
      }
    }
    this.emit("next", this);
    return this.commandMessage;
  }

  async jumpTo(page) {
    if (isNaN(page) || this.pages[page] === undefined) {
      throw new Error("Invalid page");
    }
    await this.update(this.pages[page]);

    this.emit("page", {
      page,
      paginator: this
    });
    return this.commandMessage;
  }

  stop(timeout = false) {
    this.emit("stop", this, timeout);
    this.removeAllListeners();
    const targetIndex = this.client.activeListeners.findIndex(v => v.message.id === this.message.id);
    this.client.activeListeners.splice(targetIndex, 1);
    // Disable components
    this.update({components:[]});
    return this;
  }
};