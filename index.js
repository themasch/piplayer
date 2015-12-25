var MpvClient = require('./lib/mpv'),
    mpv       = new MpvClient('/tmp/mpv_socket');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var URL = require('url');
var Path = require('path');

function isUrl(path) {
    var data = URL.parse(path);
    return data.slashes;
}

function playlistEntry(entry) {
    if (isUrl(entry.filename)) {
        //return URL.parse(entry.filename).path;
        entry.name = entry.filename;
        return entry;
    } else {
        var parts = Path.parse(entry.filename);
        return {
            path: entry.filename,
            name: parts.name,
            current: entry.current
        } ;
    }
}

function translateMetadata(metadata) {
    "use strict";
    if (metadata['icy-title']) {
        let data = metadata['icy-title'].split(' - ');
        metadata.artist = data[0];
        metadata.title  = data[1];
    }

    return metadata;
}

app.use(express.static('./public'))

app.get('/playlist', function(req, resp) {
    mpv.getPlaylist()
        .then(function(data) {
            resp.send(data.map(playlistEntry));
        })
})

app.get('/metadata', function(req, resp) {
    mpv.getMetadata()
        .then(function(data) {
            resp.send(data);
        })
})


io.on('connection', function(socket){
    console.log('a user connected');
    var observing = {};
    socket.on('call', function(data, fn) {
        console.log(data);
        switch(data.method) {
            case 'observe':
                var eventName = data.parameters.eventName;
                if (observing[eventName]) {
                    return fn(true);
                }

                observing[eventName] = function(data) {
                    socket.emit(eventName, data)
                };
                mpv.on(eventName, observing[eventName]);
                return fn(true);

            case 'getPlaylist':
                mpv.getPlaylist()
                    .then(function(data) {
                        fn(data.map(playlistEntry))
                    })
                break;

            case 'getMetadata':
                mpv.getMetadata()
                    .then(translateMetadata)
                    .then(fn)
                break;

            case 'observe_property':
                mpv.observe(data.parameters.propertyName).then(fn);
                break;

            case 'get_property':
                mpv.getProperty(data.parameters.propertyName).then(fn);
                break;

            case 'set_property':
            console.log('set_property', data);
                mpv.setProperty(data.parameters.propertyName, data.parameters.value).then(fn);
                break;

            case 'pause':
                console.log('pause')
                mpv.setProperty('pause', true).then(console.log.bind(console));
                break;

            case 'unpause':
                console.log('unpause')
                mpv.setProperty('pause', false).then(console.log.bind(console));
                break;
        }
    })
});


mpv.on('tracks-changed', function() {
    console.log('tracks-changed')
})
mpv.observe('metadata');

http.listen(3000)
