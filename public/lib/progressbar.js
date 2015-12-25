(function(root) {

    var PLV = root.ProgressBar = function(socket, rootElement, value) {
        this.rootElement = rootElement;
        this.socket = socket;

        this.socket.observeProperty(value, function(percent) {
            this.rootElement.querySelector('.progress-bar').style.width = percent + '%';
        }.bind(this))
        this.draw();
    }

    PLV.prototype.draw = function() {
        this.socket.getProperty('percent-pos')
            .then(function(percent) {
                this.rootElement.innerHTML = [
                    '<div class="progress">',
                        '<div class="progress-bar"',
                             'role="progressbar"',
                             'style="width: ',percent,'%;">',
                        '</div>',
                    '</div>'
                ].join('');
            }.bind(this))
    }

})(window);
