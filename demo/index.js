const BALL_SIZE = 10;
const BALL_STEP = 8;

const $container = document.querySelector('#container');
const ballList = [];

function getSize(dom) {
  return [dom.clientWidth, dom.clientHeight];
}

function getRandom(max) {
  return Math.floor(Math.random() * max);
}

function createBall(size) {
  const $ball = document.createElement('div');
  $ball.classList.add('ball');
  $ball.style.width = `${size}px`;
  $ball.style.height = `${size}px`;
  const [containerWidth, containerHeight] = getSize($container);
  $ball.style.top = `${getRandom(containerHeight - size)}px`;
  $ball.style.left = `${getRandom(containerWidth - size)}px`;
  $ball.dataset.dir = 'down';
  $container.appendChild($ball);
  ballList.push($ball);
}

function removeBall() {
  if (ballList.length < 1) {
    return;
  }
  const index = getRandom(ballList.length);
  ballList[index].remove();
  ballList.splice(index, 1);
}

function clearBall() {
  if (ballList.length < 1) {
    return;
  }
  for (let i = 0; i < ballList.length; i++) {
    ballList[i].remove();
  }
  ballList.length = 0;
}

function ballRunning($ball) {
  const [, containerHeight] = getSize($container);
  let top = parseInt($ball.style.top);
  let dir = $ball.dataset.dir;
  if (dir === 'down') {
    top += BALL_STEP;
    if (top + BALL_SIZE > containerHeight) {
      top = containerHeight - BALL_SIZE - (top + BALL_SIZE - containerHeight);
      dir = 'up';
    }
  } else {
    top -= BALL_STEP;
    if (top < 0) {
      top = -top;
      dir = 'down';
    }
  }
  $ball.style.top = `${top}px`;
  $ball.dataset.dir = dir;
}

(function loop() {
  for (let i = 0; i < ballList.length; i++) {
    const $ball = ballList[i];
    ballRunning($ball);
  }
  requestAnimationFrame(loop);
})();

const $addBtn = document.querySelector('#addBtn');
const $addInput = document.querySelector('#addInput');
function add() {
  const num = parseInt($addInput.value);
  for (let i = 0; i < num; i++) {
    createBall(BALL_SIZE);
  }
}
$addBtn.addEventListener('click', add);

const $removeBtn = document.querySelector('#removeBtn');
const $removeInput = document.querySelector('#removeInput');
function remove() {
  const num = parseInt($removeInput.value);
  for (let i = 0; i < num; i++) {
    removeBall();
  }
}
$removeBtn.addEventListener('click', remove);

const $clearBtn = document.querySelector('#clearBtn');
$clearBtn.addEventListener('click', clearBall);

const $fps = document.querySelector('#fps');
const $rate = document.querySelector('#rate');

const watcher = new FpsWatcher();
watcher.defineEvent({ min: 30, name: 'smooth' });
watcher.defineEvent({ min: 10, max: 30, name: 'lag' });
watcher.defineEvent({ max: 10, name: 'laggiest' });
watcher.on('changed', ({ fps }) => {
  $rate.innerText = `FPS: ${fps} HZ`;
});
watcher.on('smooth', () => {
  $fps.classList.add('smooth');
  $fps.classList.remove('lag');
  $fps.classList.remove('laggiest');
});
watcher.on('lag', () => {
  $fps.classList.remove('smooth');
  $fps.classList.add('lag');
  $fps.classList.remove('laggiest');
});
watcher.on('laggiest', () => {
  $fps.classList.remove('smooth');
  $fps.classList.remove('lag');
  $fps.classList.add('laggiest');
});
watcher.watch();

add();
