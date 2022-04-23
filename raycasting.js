function init() {
    console.log('Initializing...');

    document.addEventListener("keydown", (event) => {
        const { key } = event;
        switch (key) {
            case 'a': turnLeft(); break;
            case 'd': turnRight(); break;
            case 'w': moveForward(); break;
            case 's': moveBackward(); break;
        }
        render();
    });

    let player = { x: 1.1, y: 1.7, angle: 6.1 };

    function turnLeft(a = 0.1) {
        player.angle -= a;
    }
    function turnRight(a = 0.1) {
        turnLeft(-a);
    }
    function moveForward(step = 0.1) {
        player.x += step * Math.cos(player.angle);
        player.y += step * Math.sin(player.angle);
    }
    function moveBackward(step = 0.1) {
        moveForward(-step);
    }

    function drawMapMarker(x, y, color = 'black') {
        const map = document.getElementById('map');
        const ctx = map.getContext('2d');
        const { width } = map;
        const scale = width / 8;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x * scale, y * scale, scale / 10, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    function drawMapLine(x1, y1, x2, y2, color = 'gray') {
        const map = document.getElementById('map');
        const ctx = map.getContext('2d');
        const { width } = map;
        const scale = width / 8;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1 * scale, y1 * scale);
        ctx.lineTo(x2 * scale, y2 * scale);
        ctx.stroke();
    }

    function clearMap() {
        const map = document.getElementById('map');
        const ctx = map.getContext('2d');
        const { width, height } = map;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

    }

    function render() {
        clearMap();

        const { x, y, angle } = player;
        drawMapMarker(x, y);

        const len = 1;
        const dx = Math.cos(angle) * len;
        const dy = Math.sin(angle) * len;
        drawMapLine(x, y, x + dx, y + dy, 'yellow');
    }

    render();
}
