const net = require("net");




const server = net.createServer((socket) => {
  socket.on("data",(data)=>{
    const req=data.toString();
    // Extract the request line (first line of the request)
    const [requestLine, ...headers] = req.split('\r\n');
    
    // Extract the method, path, and HTTP version from the request line
    const [method, path, httpVersion] = requestLine.split(' ');

    // Check the request path and respond
    if (path === '/index.html') {
      // Respond with 200 OK
      const response = [
        'HTTP/1.1 200 OK',
        'Content-Type: text/html; charset=UTF-8',
        'Content-Length: 13',
        'Connection: close',
        '',
        '<h1>Hello</h1>'
      ].join('\r\n');
      
      socket.write(response);
    } else {
      // Respond with 404 Not Found
      const response = [
        'HTTP/1.1 404 Not Found',
        'Content-Type: text/html; charset=UTF-8',
        'Content-Length: 9',
        'Connection: close',
        '',
        'Not Found'
      ].join('\r\n');
      
      socket.write(response);
    }
    socket.end();
  });
  socket.on('close', () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
