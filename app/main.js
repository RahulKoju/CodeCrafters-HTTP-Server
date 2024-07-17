const net = require("net");
const fs = require("fs");
const path1 = require('path');


const server = net.createServer((socket) => {
  socket.on("data",(data)=>{
    const req=data.toString();
    // Extract the request line (first line of the request)
    const [requestLine, ...headers] = req.split('\r\n');
    
    // Extract the method, path, and HTTP version from the request line
    const [method, path, httpVersion] = requestLine.split(' ');

    // Check the request path and respond
    if (path === '/index.html' || path === '/') {
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
    }
    else if(path.includes("/echo/")){
      const content=path.split("/echo/")[1];
      const response = [
        'HTTP/1.1 200 OK',
        'Content-Type: text/plain',
        `Content-Length: ${content.length}`,
        'Connection: close',
        '',
        content
      ].join('\r\n');
      socket.write(response);
    }
    else if(path.includes("/user-agent")){
      const userAgent= headers[1].split(': ')[1];
      const response = [
        'HTTP/1.1 200 OK',
        'Content-Type: text/plain',
        `Content-Length: ${userAgent.length}`,
        'Connection: close',
        '',
        userAgent
      ].join('\r\n');
      socket.write(response);
    }
    else if(path.includes("/files/")){
      const filename=path.split("/")[2];
      const directory=process.argv[3];
      const filePath=path1.join(directory,filename);
      if(fs.readFile(filePath,(err,fileContent)=>{
        if(err){
          const response = [
            'HTTP/1.1 404 NOT FOUND',
            'Connection: close',
            '',
            'NOT FOUND'
          ].join('\r\n');
          socket.write(response);
        }
        else{
          const response = [
            'HTTP/1.1 200 OK',
            'Content-Type: application/octet-stream',
            `Content-Length: ${Buffer.byteLength(fileContent)}`,
            'Connection: close',
            '',
            fileContent
          ].join('\r\n');
          socket.write(response);
        }
      }))
      return;
    }
    else {
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
