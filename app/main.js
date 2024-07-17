const net = require("net");
const fs = require("fs");
const path = require('path');

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const req = data.toString();

    // Extract the request line (first line of the request)
    const [requestLine, ...headers] = req.split('\r\n');
    
    // Extract the method, path, and HTTP version from the request line
    const [method, urlPath, httpVersion] = requestLine.split(' ');

    // Handle GET requests based on the path
    if (urlPath === '/index.html' || urlPath === '/') {
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
      socket.end();
    } else if (urlPath.includes("/echo/")) {
      // Extract content to echo
      const content = urlPath.split("/echo/")[1];
      const response = [
        'HTTP/1.1 200 OK',
        'Content-Type: text/plain',
        `Content-Length: ${content.length}`,
        'Connection: close',
        '',
        content
      ].join('\r\n');
      socket.write(response);
      socket.end();
    } else if (urlPath === '/user-agent') {
      // Extract User-Agent header
      const userAgent = headers[1].split(": ")[1];
      const response = [
        'HTTP/1.1 200 OK',
        'Content-Type: text/plain',
        `Content-Length: ${userAgent.length}`,
        'Connection: close',
        '',
        userAgent
      ].join('\r\n');
      socket.write(response);
      socket.end();
    } else if (urlPath.startsWith("/files/") && method==="GET") {
      // Extract filename from path
      const filename = urlPath.split("/")[2];
      const directory = process.argv[3]; // Assuming directory path is passed as command-line argument
      const filePath = path.join(directory, filename);
      // Read file asynchronously
      fs.readFile(filePath, (err, fileContent) => {
        if (err) {
          // File not found
          const response = [
            'HTTP/1.1 404 Not Found',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Length: 9',
            'Connection: close',
            '',
            'Not Found'
          ].join('\r\n');
          socket.write(response);
        } else {
          // File found, respond with its contents
          const response = [
            'HTTP/1.1 200 OK',
            'Content-Type: application/octet-stream',
            `Content-Length: ${fileContent.length}`,
            'Connection: close',
            '',
            fileContent
          ].join('\r\n');
          socket.write(response);
        }
        socket.end(); // Ensure socket is closed after sending response
      });
    } 
    else if(urlPath.startsWith("/files/") && method==="POST"){
      const directory=process.argv[3];
      const filename=urlPath.split("/")[2];
      const filePath=path.join(directory,filename);
      const reqq=req.split("\r\n");
      const body=reqq[reqq.length-1];
      fs.writeFile(filePath,body,(err)=>{
        if(err){
          const response=[
            "HTTP/1.1 500 INTERNAL SERVER ERROR",
            'Content-Type: text/html; charset=UTF-8',
            'Content-Length: 21',
            'Connection: close',
            '',
            'Internal Server Error'
          ].join('\r\n');
          socket.write(response);
          socket.end();
        }else{
          const response = [
            'HTTP/1.1 201 Created',
            'Connection: close',
            '',
            ''
          ].join('\r\n');
          socket.write(response);
          socket.end();
        }
      })
    }
    else {
      // Respond with 404 Not Found for other paths
      const response = [
        'HTTP/1.1 404 Not Found',
        'Content-Type: text/html; charset=UTF-8',
        'Content-Length: 9',
        'Connection: close',
        '',
        'Not Found'
      ].join('\r\n');
      socket.write(response);
      socket.end();
    }
  });

  socket.on('close', () => {
    console.log('Socket closed');
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
    socket.destroy(); // Ensure socket is destroyed on error
  });
});

server.listen(4221, "localhost", () => {
  console.log('Server listening on port 4221');
});
