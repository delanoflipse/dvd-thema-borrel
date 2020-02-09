import { lcm } from 'mathjs'

const $logo = document.getElementById('dvd-logo');
const $targetLine = document.getElementById('target-line');

const $statTotal = document.getElementById('total-count');
const $lastTotal = document.getElementById('last-count');
const $bounceTotal = document.getElementById('bounce-count');

const colors = ['#FFFFFF', '#fffa00', '#be00ff', '#ff008b', '#ff8300', '#0026ff', '#ff2600', '#26ff00', '#00feff'];


const state = {
	x: 0,
	y: 0,
	dx: 1,
	dy: 1,
	colorIndex: 0,
	speed: 3,
	width: Math.round($logo.clientWidth),
	height: Math.round($logo.clientHeight),
	bounceX: 0,
	bounceY: 0,
	cornerX: 0,
	cornerY: 0,
	totals: {
		total: 0,
		last: 0,
		bounce: 0,
	},
}

function getCycleTime() {
	const pageWidth = window.innerWidth;
	const pageHeight = window.innerHeight;

	const traverseTime = pageWidth / state.speed;
	const heightDelta = pageHeight - state.height;
	const widthDelta = pageWidth - state.width;

	return (traverseTime * lcm(heightDelta, widthDelta)) / widthDelta
}

console.log(getCycleTime());
console.log(getCycleTime() / 60, 'seconds');
console.log(getCycleTime() / 60 / 60, 'minutes');


function getProjectedBounce(pageWidth, pageHeight) {
	// bottom right
	if (state.dx === 1 && state.dy === 1) {
		state.cornerX = state.x + state.width;
		state.cornerY = state.y + state.height;
		state.bounceX = pageWidth;
		state.bounceY = state.cornerY + state.bounceX - state.cornerX;
	}
	// bottom left
	else if (state.dx === -1 && state.dy === 1) {
		state.cornerX = state.x;
		state.cornerY = state.y + state.height;
		state.bounceX = 0;
		state.bounceY = state.cornerY + state.cornerX - state.bounceX;
	}
	// top left
	else  if (state.dx === -1 && state.dy === -1) {
		state.cornerX = state.x;
		state.cornerY = state.y;
		state.bounceX = 0;
		state.bounceY = state.cornerY + state.bounceX - state.cornerX;
	}
	// top right
	else if (state.dx === 1 && state.dy === -1) {
		state.cornerX = state.x + state.width;
		state.cornerY = state.y;
		state.bounceX = pageWidth;
		state.bounceY = state.cornerY + state.cornerX - state.bounceX;
	}

}

function checkForBounce() {
	const pageWidth = window.innerWidth;
	const pageHeight = window.innerHeight;

	let bounceX = false;
	let bounceY = false;

	let xOverlap = 0;
	let yOverlap = 0;

	// reflect bottom x axis
	if (state.x + state.width > pageWidth) {
		bounceX = true;
		xOverlap = state.x + state.width - pageWidth;
		state.x -= xOverlap;
	}

	// reflect top x axis
	if (state.y + state.height > pageHeight) {
		bounceY = true;
		yOverlap = state.y + state.height - pageHeight;
		state.y -= yOverlap;
	}

	// reflect left y axis
	if (state.x < 0) {
		bounceX = true;
		state.x *= -1;
	}

	// reflect right y axis
	if (state.y < 0) {
		bounceY = true;
		state.y *= -1;
	}


	if (bounceX) {
		state.dx *= -1;
		state.totals.total++;
		state.totals.last++;
	}

	if (bounceY) {
		state.dy *= -1;
		state.totals.total++;
		state.totals.last++;
	}

	if (bounceX && bounceY) {
		state.totals.bounce++;
		state.totals.last = 0;
	}

	if (bounceX || bounceY) {
		state.colorIndex++;

		if (state.colorIndex >= colors.length) {
			state.colorIndex = 0;
		}

		$logo.style.fill = colors[state.colorIndex];
	}

	getProjectedBounce(pageWidth, pageHeight);

	return bounceX || bounceY;
}

function loop() {
	state.x += state.dx * state.speed;
	state.y += state.dy * state.speed;

	for (let i = 0; i < 3 && checkForBounce(); i++) {}

	$logo.style.transform = `translate(${state.x}px, ${state.y}px)`;
	$targetLine.setAttribute('x1', state.cornerX);
	$targetLine.setAttribute('x2', state.bounceX);
	$targetLine.setAttribute('y1', state.cornerY);
	$targetLine.setAttribute('y2', state.bounceY);

	$statTotal.innerText = state.totals.total;
	$lastTotal.innerText = state.totals.last;
	$bounceTotal.innerText = state.totals.bounce;

	window.requestAnimationFrame(() => loop());
}

loop();
