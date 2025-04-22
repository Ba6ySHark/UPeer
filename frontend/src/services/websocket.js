import { WS_URL } from '../config';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.messageHandlers = [];
  }

  // Connect to WebSocket server
  connect(groupId, token) {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = new WebSocket(`${WS_URL}/ws/chat/${groupId}/?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Notify all registered handlers of new message
      this.messageHandlers.forEach(handler => handler(data));
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed', event);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // Send a message
  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ message }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Register a message handler
  onMessage(handler) {
    this.messageHandlers.push(handler);
    
    // Return a function to unregister the handler
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService; 