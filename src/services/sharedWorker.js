self.addEventListener('connect', (e) => {
  const port = e.ports.at(0);

  port.addEventListener('message', (e) => {
    console.log(1);
  });
});

// import C from '@/constants/constants';
// // eslint-disable-next-line no-debugger
// debugger;
// const connections = [];

// const socket = new WebSocket(`${C.BASE_URL_WS}/v2?api_key=${C.API_KEY}`);

// socket.addEventListener('message', (e) => {
//   connections.forEach((port) => port.postMessage(e.data));
// });

// self.onconnect = (event) => {
//   const port = event.ports[0];
//   connections.push(port);
//   console.log(connections);

//   port.onmessage = (event) => {
//     if (socket.readyState === WebSocket.OPEN) {
//       socket.send(event.data);
//       return;
//     }

//     socket.addEventListener(
//       'open',
//       () => {
//         socket.send(event.data);
//       },
//       { once: true }
//     );
//   };

//   port.start();
// };
