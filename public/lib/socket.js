function patchSocket(socket) {
    socket.call = function(method, parameters) {
        return new Promise(function(resolve, reject) {
            this.emit('call', {
                method: method,
                parameters: parameters
            }, function(result) {
                resolve(result);
            });
        }.bind(this));
    }

    socket.setProperty = function(property, value) {
        return this.call('set_property', {
            propertyName: property,
            value: value
        });
    };

    socket.getProperty = function(property) {
        return this.call('get_property', {
            propertyName: property
        });
    };

    socket.observe = function(eventName, callback) {
        this.call('observe', { eventName: eventName });
        this.on(eventName, callback);
    };

    socket.observeProperty = function(propertyName, callback) {
        this.call('observe_property', { propertyName: propertyName })
            .then(function() {
                this.observe('property-change:' + propertyName, callback)
            }.bind(this));

    };
}
