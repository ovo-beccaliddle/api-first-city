"use strict";
/**
 * Setup script for Google Pub/Sub topics and subscriptions
 * This script initializes all needed topics for the city services
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEventBus = setupEventBus;
const pubsub_1 = require("@google-cloud/pubsub");
// Create Pub/Sub client
const pubsub = new pubsub_1.PubSub({
    projectId: process.env.PUBSUB_PROJECT_ID || 'city-services',
    // For development, use the emulator host if available
    apiEndpoint: process.env.PUBSUB_EMULATOR_HOST ? `${process.env.PUBSUB_EMULATOR_HOST}` : undefined,
});
// Define all topics that should be created for the workshop
const TOPICS = [
    // Emergency service events
    'emergency.incidents.reported',
    'emergency.incidents.updated',
    'emergency.incidents.resolved',
    // Utility service events
    'utilities.outages.reported',
    'utilities.maintenance.scheduled',
    // Transportation events
    'transportation.traffic.congestion',
    'transportation.public-transit.delays',
    // Citizen service events
    'citizen.requests.submitted',
    'citizen.permits.approved',
    // Sample service events
    'sample.resources.created',
    'sample.resources.updated',
    'sample.resources.deleted',
];
/**
 * Create a topic if it doesn't exist
 */
async function createTopicIfNotExists(topicName) {
    try {
        // Check if topic exists
        const [exists] = await pubsub.topic(topicName).exists();
        if (!exists) {
            console.log(`Creating topic: ${topicName}`);
            await pubsub.createTopic(topicName);
            console.log(`Topic ${topicName} created.`);
        }
        else {
            console.log(`Topic ${topicName} already exists.`);
        }
    }
    catch (error) {
        console.error(`Error creating topic ${topicName}:`, error);
        throw error;
    }
}
/**
 * Setup all event bus topics
 */
async function setupEventBus() {
    console.log('Setting up event bus topics...');
    try {
        // Create all topics in parallel
        await Promise.all(TOPICS.map(createTopicIfNotExists));
        console.log('Event bus topics created successfully');
    }
    catch (error) {
        console.error('Failed to set up event bus:', error);
        throw error;
    }
}
// Run setup if this script is executed directly
if (require.main === module) {
    setupEventBus().catch((error) => {
        console.error('Setup failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=setup.js.map