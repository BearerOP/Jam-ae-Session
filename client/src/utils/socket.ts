const socketClient = (url: string): WebSocket => {
    return new WebSocket(url);
};

export default socketClient;