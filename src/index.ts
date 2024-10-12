import { WebSocketServer, WebSocket } from "ws";
import { createClient } from "redis";
const publishClient = createClient();
const subscribeClient = createClient();
async function connectToRedis() {
  try {
    await publishClient.connect();
    await subscribeClient.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    process.exit(1);
  }
}

connectToRedis();

const port1 = 8080;
const port2 = 8081;

const wss1 = new WebSocketServer({ port: port1 });
const wss2 = new WebSocketServer({ port: port2 });

// {
//     "type":"sendMessage",
//     "roomID":"room1",
//     "message":"hiii"
// }
//key is useId here
// ws is the user ws connection object here
// rooms is the array of rooms user subscribed to

function setupWebSocketServer(wss: WebSocketServer) {
  const subscription: {
    [key: string]: {
      ws: WebSocket;
      rooms: string[];
    };
  } = {};
  wss.on("connection", function (useSocket) {
    const id = genRandomNum();
    subscription[id] = {
      ws: useSocket,
      rooms: [],
    };
    useSocket.on("message", function (data) {
      //@ts-ignore
      const message = JSON.parse(data);

      if (message.type === "SUBSCRIEB") {
        subscription[id].rooms.push(message.roomID);
        useSocket.send("SUBSCRIEBED");
        //checks for the first person to subsribe to the roomID
        //if yes then subscribe to the redis pub/sub

        if (oneUserSubscribedTo(message.roomID, subscription)) {
          console.log("first person joined room");
          subscribeClient.subscribe(message.roomID, (message) => {
            const parsedMessage = JSON.parse(message);
            Object.keys(subscription).forEach((userId) => {
              const { ws, rooms } = subscription[userId];
              if (rooms.includes(parsedMessage.roomID)) {
                ws.send(parsedMessage.message);
              }
            });
          });
        }
      }
      if (message.type === "UNSUBSCRIEB") {
        subscription[id].rooms = subscription[id].rooms.filter(
          (roomID) => roomID !== message.roomID
        );
        if (lastPersonLeftRoom(message.roomID, subscription)) {
          console.log("last person left room");
          subscribeClient.unsubscribe(message.roomID);
        }
      }
      if (message.type === "sendMessage") {
        const roomID = message.roomID;
        const recvMessage = message.message;
        //without using redis here
        // Object.entries(subscription).forEach(([userId, { ws, rooms }]) => {
        //   if (rooms.includes(roomID)) {
        //     ws.send(recvMessage);
        //   }
        // });
        //with redis
        console.log("publishing the message", roomID, recvMessage);
        publishClient.publish(
          roomID,
          JSON.stringify({
            type: "sendMessage",
            roomID,
            message: recvMessage,
          })
        );
      }
    });
  });
}

setupWebSocketServer(wss1);
setupWebSocketServer(wss2);

function genRandomNum() {
  return Math.random();
}

function oneUserSubscribedTo(roomID: string, subscription: any): boolean {
  let totalSubscribed = 0;
  Object.keys(subscription).map((userID) => {
    if (subscription[userID].rooms.includes(roomID)) {
      totalSubscribed++;
    }
  });
  if (totalSubscribed == 1) {
    return true;
  }
  return false;
}
function lastPersonLeftRoom(roomID: string, subscription: any): boolean {
  let totalSubscribed = 0;
  Object.keys(subscription).map((userID) => {
    if (subscription[userID].rooms.includes(roomID)) {
      totalSubscribed++;
    }
  });
  if (totalSubscribed == 0) {
    return true;
  }
  return false;
}

console.log(`WebSocket servers running on ports ${port1} and ${port2}`);
