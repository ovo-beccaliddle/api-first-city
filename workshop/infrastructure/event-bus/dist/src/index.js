"use strict";
/**
 * Event Bus module exports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = exports.EventSubscriber = exports.EventPublisher = exports.setupEventBus = void 0;
var setup_1 = require("./setup");
Object.defineProperty(exports, "setupEventBus", { enumerable: true, get: function () { return setup_1.setupEventBus; } });
var publisher_1 = require("./publisher");
Object.defineProperty(exports, "EventPublisher", { enumerable: true, get: function () { return publisher_1.EventPublisher; } });
var subscriber_1 = require("./subscriber");
Object.defineProperty(exports, "EventSubscriber", { enumerable: true, get: function () { return subscriber_1.EventSubscriber; } });
// Main client for ease of use
const publisher_2 = require("./publisher");
const subscriber_2 = require("./subscriber");
/**
 * Combined EventBus client for publishing and subscribing
 */
class EventBus {
    constructor(options = {}) {
        this.publisher = new publisher_2.EventPublisher(options);
        this.subscriber = new subscriber_2.EventSubscriber(options);
    }
    /**
     * Close all subscriptions when shutting down
     */
    async close() {
        await this.subscriber.closeAll();
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=index.js.map