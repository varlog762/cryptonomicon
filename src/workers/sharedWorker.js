const connections = [];

self.addEventListener('connect', (e) => {
  const port = e.ports[0];
  port.start();

  connections.push(e.ports[0]);

  port.addEventListener('message', (e) => {
    connections.forEach((p) => {
      p.postMessage(e.data);
    });
  });
});
