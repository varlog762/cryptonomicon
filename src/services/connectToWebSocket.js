import C from '@/constants/constants';

try {
  const socket = new WebSocket(
    new URL(`${C.BASE_URL_WS}/v2?api_key=${C.API_KEY}`, import.meta.url)
  );

  const sharedWorker = new SharedWorker(new URL('../workers/sharedWorker.js', import.meta.url));
  sharedWorker.port.start();

  sharedWorker.port.addEventListener('message', (e) => {
    const messageToWebSocket = JSON.parse(e.data);

    if (
      messageToWebSocket.action === C.REMOVE_SUBSCRIBE_ACTION ||
      messageToWebSocket.action === C.ADD_SUBSCRIBE_ACTION
    ) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(e.data);
        return;
      }

      socket.addEventListener(
        'open',
        () => {
          socket.send(e.data);
        },
        { once: true }
      );
    }
  });

  socket.addEventListener('message', (e) => {
    sharedWorker.port.postMessage(e.data);
  });
} catch (error) {
  console.log(error);
}
