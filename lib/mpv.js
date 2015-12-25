'use strict';
const net = require('net')
const util = require('util');
const EventEmitter = require('events');

function Client(socketPath) {
    EventEmitter.call(this);

    this.socket = net.connect(socketPath, function() {
        console.info('connected to ', socketPath);
    });

    this.socket.on('error', console.error.bind(console))

    this.requestId = 1
    this.handlers = [];

    this.socket.on('data', function(chunk) {
        var msg = chunk.toString().split("\n");
        for(var i=0;i<msg.length;i++) {
            if (msg[i].match(/^\s*$/)) {
                continue;
            }
            var data = JSON.parse(msg[i]);
            if (data && data.event) {
                if (data.event === 'property-change') {
                    this.emit('property-change:' + data.name, data.data);
                } else {
                    this.emit(data.event)
                }
            }
            else if (data && data.request_id) {
                this.handleResponse(data)
            } else {
                console.log(data)
            }
        }
    }.bind(this))
}

util.inherits(Client, EventEmitter);

Client.prototype.handleResponse = function(msg) {
    var id = msg.request_id

    if(this.handlers[id] === undefined) {
        console.error("no handlers for id ", id, "msg: ", msg);
        return;
    }

    var handler = this.handlers[id];
    if (msg.error === 'success') {
        return handler.resolve(msg.data)
    }

    handler.reject(msg.error)
}

Client.prototype.attachResponseId = function(id, resolve, reject) {
    this.handlers[id] = { resolve: resolve, reject: reject }
}

Client.prototype.getProperty = function(property) {
    return this.sendCommand('get_property', property)
}

Client.prototype.setProperty = function(property, value) {
    return this.sendCommand('set_property', [ property, value ]);
};

Client.prototype.sendCommand = function(command, parameters) {
    var args = [command].concat(parameters);
    var id   = this.requestId++;
    return new Promise(function(resolve, reject) {
        this.attachResponseId(id, resolve, reject)
        this.socket.write(JSON.stringify({
            command: args,
            request_id: id
        }))
        console.log(JSON.stringify({
            command: args,
            request_id: id
        }));
        this.socket.write("\n");

    }.bind(this))
};

Client.prototype.getPlaylist = function() {
    return this.sendCommand('get_property', [ 'playlist' ]);
}

Client.prototype.getMetadata = function() {
    return this.sendCommand('get_property', [ 'metadata' ]);
}

var observeCnt = 0;
Client.prototype.observe = function(property) {
    return this.sendCommand('observe_property', [ observeCnt++,  property ])
}
module.exports = Client
