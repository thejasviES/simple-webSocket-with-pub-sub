# Simple WebSocket Server with Redis Pub/Sub

This project implements a WebSocket server with Redis Pub/Sub functionality, allowing real-time communication across multiple server instances.

## Key Features

1. **Dual WebSocket Servers**: Runs two WebSocket servers on ports 8080 and 8081.
2. **Redis Integration**: Uses Redis for pub/sub messaging between server instances.
3. **Room-based Messaging**: Supports subscribing to and sending messages within specific rooms.
4. **Scalable Architecture**: Designed to work across multiple server instances.

## Code Structure

- **Redis Setup**: 
  - Creates separate Redis clients for publishing and subscribing.
  - Implements a `connectToRedis` function for establishing connections.

- **WebSocket Server Setup**:
  - Creates two WebSocket servers using the `ws` library.
  - Implements a `setupWebSocketServer` function to handle WebSocket logic.

- **Subscription Management**:
  - Maintains a `subscription` object to track user connections and room subscriptions.
  - Generates unique IDs for each connection using `genRandomNum`.

- **Message Handling**:
  - Supports three types of messages: "SUBSCRIEB", "UNSUBSCRIEB", and "sendMessage".
  - Implements room subscription/unsubscription logic.
  - Uses Redis pub/sub for message broadcasting.

- **Helper Functions**:
  - `oneUserSubscribedTo`: Checks if a user is the first to subscribe to a room.
  - `lastPersonLeftRoom`: Checks if the last person has left a room.


This implementation provides a solid foundation for a scalable, real-time messaging system using WebSockets and Redis.
