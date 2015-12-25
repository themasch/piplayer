(function(root) {

    var PLV = root.PlaylistView = function(socket, rootElement) {
        this.refreshInterval = 10000;
        this.rootElement = rootElement;
        this.socket = socket;

        this.refresh();

        this.socket.observe('tracks-changed', this.refresh.bind(this))

        this.rootElement.addEventListener('click', function(event) {
            this.socket.setProperty('playlist-pos', parseInt(event.target.dataset.trackIndex, 10));
        }.bind(this), false);
    }

    PLV.prototype.refresh = function() {
        this.socket.call('getPlaylist')
            .then(function(playlist) {
                var i = 0;
                this.rootElement.innerHTML = playlist.map(function(entry) {
                    var html  = ['<li class="list-group-item'];
                    if (entry.current === true) {
                        html.push(' list-group-item-info')
                    }
                    html.push('" ');
                    html.push('data-track-index="' + i + '"');
                    html.push('">')
                    html.push(entry.name);
                    html.push('</li>');
                    i++;

                    return html.join('');
                }).join("\n");
            }.bind(this))
    }
})(window);
