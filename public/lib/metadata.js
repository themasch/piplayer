(function(root) {

    var PLV = root.MetadataView = function(socket, rootElement) {
        this.refreshInterval = 2000;
        this.rootElement = rootElement;
        this.socket = socket;

        this.socket.observe('tracks-changed', this.refresh.bind(this));
        this.socket.observe('metadata-update', this.refresh.bind(this));
        this.refresh();
    }

    PLV.prototype.refresh = function() {
        this.socket.call('getMetadata')
            .then(function(metadata) {
                this.rootElement.innerHTML = [
                    metadata.artist + ' - ' + metadata.title,
                    '<br /><small>',
                    metadata.album,
                    '</small>'
                ].join('');
            }.bind(this))
    }

})(window);
