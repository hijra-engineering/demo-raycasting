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

    const MAP = [
        1, 1, 1, 1, 6, 1, 1, 1,
        1, 0, 0, 1, 0, 0, 0, 7,
        1, 1, 0, 1, 0, 1, 1, 1,
        6, 0, 0, 0, 0, 0, 0, 7,
        1, 8, 8, 0, 0, 0, 1, 1,
        2, 2, 0, 0, 8, 8, 8, 1,
        3, 0, 0, 0, 0, 0, 0, 5,
        2, 2, 2, 2, 7, 4, 4, 4,
    ];

    function tileAt(x, y) {
        const p = Math.floor(x);
        const q = Math.floor(y);
        if (x < 0 || y < 0 || x > 8 || y > 8) {
            return 1;
        }
        return MAP[p + q * 8];
    }

    function tileColor(tile) {
        return [
            'white',
            'blue',
            'saddlebrown',
            'olive',
            'green',
            'brown',
            'gray',
            'chocolate',
            'lightgray',
            'gray']
        [tile];
    }


    function updateMap() {
        const map = document.getElementById('map');
        const ctx = map.getContext('2d');

        const { width } = map;
        const scale = width / 8;

        for (let i = 0; i < 8; ++i) {
            for (let j = 0; j < 8; ++j) {
                const tile = tileAt(i, j);
                ctx.fillStyle = tileColor(tile);
                ctx.fillRect(i * scale, j * scale, i * scale + scale, j * scale + scale);
            }
        }

        const { x, y, angle } = player;
        drawMapMarker(x, y);
    }


    function distance(x1, x2, y1, y2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function castEast(x, y, angle) {
        const tanAngle = Math.tan(angle);
        let wallX = Math.ceil(x);
        let wallY = y + tanAngle * (wallX - x);
        let tile = tileAt(wallX, wallY);
        while (tile === 0) {
            wallX += 1;
            wallY += tanAngle;
            tile = tileAt(wallX, wallY);
        }
        const dist = distance(x, wallX, y, wallY);
        return { wallX, wallY, dist, tile };
    }

    function castWest(x, y, angle) {
        const tanAngle = Math.tan(angle);
        let wallX = Math.floor(x);
        let wallY = y + tanAngle * (wallX - x);
        let tile = tileAt(wallX - 1, wallY);
        while (tile === 0) {
            wallX -= 1;
            wallY -= tanAngle;
            tile = tileAt(wallX - 1, wallY);
        }
        const dist = distance(x, wallX, y, wallY);
        return { wallX, wallY, dist, tile };
    }

    function castSouth(x, y, angle) {
        const cotAngle = 1 / Math.tan(angle)
        let wallY = Math.ceil(y);
        let wallX = x + cotAngle * (wallY - y);
        let tile = tileAt(wallX, wallY);
        while (tile === 0) {
            wallY += 1;
            wallX += cotAngle;
            tile = tileAt(wallX, wallY);
        }
        const dist = distance(x, wallX, y, wallY);
        return { wallX, wallY, dist, tile };
    }

    function castNorth(x, y, angle) {
        const cotAngle = 1 / Math.tan(angle)
        let wallY = Math.floor(y);
        let wallX = x + cotAngle * (wallY - y);
        let tile = tileAt(wallX, wallY - 1);
        while (tile === 0) {
            wallY -= 1;
            wallX -= cotAngle;
            tile = tileAt(wallX, wallY - 1);
        }
        const dist = distance(x, wallX, y, wallY);
        return { wallX, wallY, dist, tile };
    }

    function castRay(x, y, angle) {
        const WE = Math.cos(angle) > 0 ? castEast(x, y, angle) : castWest(x, y, angle);
        const NS = Math.sin(angle) > 0 ? castSouth(x, y, angle) : castNorth(x, y, angle);
        return (WE.dist < NS.dist) ? WE : NS;
    }

    function drawColumn(column, hit) {
        const view = document.getElementById('view');
        const ctx = view.getContext('2d');
        const { width, height } = view;

        const { dist, tile } = hit;
        const h = Math.round(width / dist);
        const center = height / 2;
        const start = Math.floor(center - h / 2);
        const end = start + h;

        ctx.lineWidth = 2;
        ctx.strokeStyle = tileColor(tile);
        ctx.beginPath();
        ctx.moveTo(column, start);
        ctx.lineTo(column, end);
        ctx.stroke();
    }

    const FOV = 45; // degrees

    function updateView() {
        const view = document.getElementById('view');
        const ctx = view.getContext('2d');
        const { width, height } = view;

        // ceiling
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, width, height / 2);

        // floor
        ctx.fillStyle = '#666';
        ctx.fillRect(0, height / 2, width, height);

        const { x, y, angle } = player;
        for (let column = 0; column < width; ++column) {
            const delta = -(column / width - 0.5) * FOV * Math.PI / 180;
            const hit = castRay(x, y, angle - delta);
            const { wallX, wallY, tile } = hit;
            drawMapMarker(wallX, wallY, 'cyan');
            drawMapLine(x, y, wallX, wallY, 'yellow');
            drawColumn(column, hit);
        }
    }

    function render() {
        updateMap();
        updateView();
    }

    render();
}
