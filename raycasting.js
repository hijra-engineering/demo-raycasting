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

}
