var server = require('http').createServer(handle);
var io = require('socket.io').listen(server);
var os = require('os');
var fs = require('fs');
var url = require('url');
var si = require('systeminformation');

function handle(req, res) {
    var root = __dirname;
    var pathname = url.parse(req.url).pathname;
    switch (url.parse(req.url).pathname) {
        case '/':
            fs.stat('html/index.html', function(err, stat) {
                if (err) {
                    if ('ENOENT' == err.code) {
                        res.statusCode = 404;
                        res.end('File Read Error.!');
                    } else {
                        res.statusCode = 500;
                        res.end('Internal Error.')
                    }
                } else {
                    fs.createReadStream('html/index.html').pipe(res);
                }
            });

            break;
        default:
            fs.stat(root + pathname, function(err, stat) {
                if (err) {
                    if ('ENOENT' == err.code) {
                        res.statusCode = 404;
                        res.end('File Read Error.!');
                    } else {
                        res.statusCode = 500;
                        res.end('Internal Error.')
                    }
                } else {
                    var stream = fs.createReadStream(__dirname + pathname);

                    fileExt = pathname.split('.')[1].toLowerCase();
                    //console.log(fileExt);
                    res.writeHeader(200, { "Content-Type": "image/" + fileExt });
                    stream.on('data', function(chunk) {
                        res.write(chunk, 'binary');
                    });
                    stream.on('end', function() {
                        res.end();
                    });
                }

            });
            break;
    }
}

var sysinfos = {};


function tick() {


    si.cpu(function(info) {
        //console.log(info);
        sysinfos.cpu = info;
        //io.sockets.send(JSON.stringify(info));
    });

    si.cpuTemperature(function(info) {
        sysinfos.temp = info;
    });

    si.currentLoad(function(info) {
        sysinfos.loads = info;
        //console.log(info);
    });

    //console.log(sysinfos);
    io.sockets.send(JSON.stringify(sysinfos));
}

setInterval(tick, 1000);

server.listen(8000);