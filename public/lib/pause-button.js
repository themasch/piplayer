socket.observe('pause', function() {
    document.getElementById('pause-button')
        .classList.add('btn-primary')
});

socket.observe('unpause', function() {
    document.getElementById('pause-button')
        .classList.remove('btn-primary')
});

document
    .getElementById('pause-button')
    .addEventListener(
        'click',
        function() {
            var btn = document.getElementById('pause-button');
            if (btn.classList.contains('btn-primary')) {
                socket.call('unpause');
            } else {
                socket.call('pause');
            }
        },
        false
    );
