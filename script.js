console.clear();

const { gsap, imagesLoaded } = window;

const buttons = {
	prev: document.querySelector(".btn--left"),
	next: document.querySelector(".btn--right"),
};
const cardsContainerEl = document.querySelector(".cards__wrapper");
const appBgContainerEl = document.querySelector(".app__bg");

const cardInfosContainerEl = document.querySelector(".info__wrapper");

buttons.next.addEventListener("click", () => swapCards("right"));

buttons.prev.addEventListener("click", () => swapCards("left"));

function swapCards(direction) {
	// robustly compute current/previous/next by index so multiple cards work
	const cards = Array.from(cardsContainerEl.querySelectorAll('.card'));
	const bgs = Array.from(appBgContainerEl.querySelectorAll('.app__bg__image'));
	const infos = Array.from(cardInfosContainerEl.querySelectorAll('.info'));

	const currentCardEl = cards.find(c => c.classList.contains('current--card')) || cards[0];
	const currentIndex = cards.indexOf(currentCardEl);
	const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
	const nextIndex = (currentIndex + 1) % cards.length;

	const previousCardEl = cards[prevIndex];
	const nextCardEl = cards[nextIndex];

	const currentBgImageEl = bgs.find(b => b.classList.contains('current--image')) || bgs[0];
	const currentBgIndex = bgs.indexOf(currentBgImageEl);
	const prevBgEl = bgs[(currentBgIndex - 1 + bgs.length) % bgs.length];
	const nextBgEl = bgs[(currentBgIndex + 1) % bgs.length];

	changeInfo(direction);
	removeCardEvents(currentCardEl);

	// remove state classes from all elements first
	cards.forEach(c => c.classList.remove('current--card','previous--card','next--card'));
	bgs.forEach(b => b.classList.remove('current--image','previous--image','next--image'));
	infos.forEach(i => i.classList.remove('current--info','previous--info','next--info'));

	// assign z-index and classes based on direction
	if (direction === 'right') {
		// rotate to the right: current -> previous, next -> current, previous -> next
		currentCardEl.style.zIndex = '50';
		previousCardEl.style.zIndex = '20';
		nextCardEl.style.zIndex = '30';

		currentCardEl.classList.add('previous--card');
		previousCardEl.classList.add('next--card');
		nextCardEl.classList.add('current--card');

		currentBgImageEl.style.zIndex = '-2';
		nextBgEl.style.zIndex = '-1';

		currentBgImageEl.classList.add('previous--image');
		prevBgEl.classList.add('next--image');
		nextBgEl.classList.add('current--image');
	} else {
		// left
		currentCardEl.style.zIndex = '50';
		previousCardEl.style.zIndex = '30';
		nextCardEl.style.zIndex = '20';

		currentCardEl.classList.add('next--card');
		previousCardEl.classList.add('current--card');
		nextCardEl.classList.add('previous--card');

		currentBgImageEl.style.zIndex = '-2';
		prevBgEl.style.zIndex = '-1';

		currentBgImageEl.classList.add('next--image');
		prevBgEl.classList.add('current--image');
		nextBgEl.classList.add('previous--image');
	}
}

function changeInfo(direction) {
	let currentInfoEl = cardInfosContainerEl.querySelector(".current--info");
	let previousInfoEl = cardInfosContainerEl.querySelector(".previous--info");
	let nextInfoEl = cardInfosContainerEl.querySelector(".next--info");

	gsap.timeline()
		.to([buttons.prev, buttons.next], {
		duration: 0.2,
		opacity: 0.5,
		pointerEvents: "none",
	})
		.to(
		currentInfoEl.querySelectorAll(".text"),
		{
			duration: 0.4,
			stagger: 0.1,
			translateY: "-120px",
			opacity: 0,
		},
		"-="
	)
		.call(() => {
		swapInfosClass(direction);
	})
		.call(() => initCardEvents())
		.fromTo(
		direction === "right"
		? nextInfoEl.querySelectorAll(".text")
		: previousInfoEl.querySelectorAll(".text"),
		{
			opacity: 0,
			translateY: "40px",
		},
		{
			duration: 0.4,
			stagger: 0.1,
			translateY: "0px",
			opacity: 1,
		}
	)
		.to([buttons.prev, buttons.next], {
		duration: 0.2,
		opacity: 1,
		pointerEvents: "all",
	});

	function swapInfosClass() {
		currentInfoEl.classList.remove("current--info");
		previousInfoEl.classList.remove("previous--info");
		nextInfoEl.classList.remove("next--info");

		if (direction === "right") {
			currentInfoEl.classList.add("previous--info");
			nextInfoEl.classList.add("current--info");
			previousInfoEl.classList.add("next--info");
		} else if (direction === "left") {
			currentInfoEl.classList.add("next--info");
			nextInfoEl.classList.add("previous--info");
			previousInfoEl.classList.add("current--info");
		}
	}
}

function updateCard(e) {
	const card = e.currentTarget;
	const box = card.getBoundingClientRect();
	const centerPosition = {
		x: box.left + box.width / 2,
		y: box.top + box.height / 2,
	};
	let angle = Math.atan2(e.pageX - centerPosition.x, 0) * (35 / Math.PI);
	gsap.set(card, {
		"--current-card-rotation-offset": `${angle}deg`,
	});
	const currentInfoEl = cardInfosContainerEl.querySelector(".current--info");
	gsap.set(currentInfoEl, {
		rotateY: `${angle}deg`,
	});
}

function resetCardTransforms(e) {
	const card = e.currentTarget;
	const currentInfoEl = cardInfosContainerEl.querySelector(".current--info");
	gsap.set(card, {
		"--current-card-rotation-offset": 0,
	});
	gsap.set(currentInfoEl, {
		rotateY: 0,
	});
}

function initCardEvents() {
	const currentCardEl = cardsContainerEl.querySelector(".current--card");
	currentCardEl.addEventListener("pointermove", updateCard);
	currentCardEl.addEventListener("pointerout", (e) => {
		resetCardTransforms(e);
	});
}

initCardEvents();

function removeCardEvents(card) {
	card.removeEventListener("pointermove", updateCard);
}

function init() {

	let tl = gsap.timeline();

	tl.to(cardsContainerEl.children, {
		delay: 0.15,
		duration: 0.5,
		stagger: {
			ease: "power4.inOut",
			from: "right",
			amount: 0.1,
		},
		"--card-translateY-offset": "0%",
	})
		.to(cardInfosContainerEl.querySelector(".current--info").querySelectorAll(".text"), {
		delay: 0.5,
		duration: 0.4,
		stagger: 0.1,
		opacity: 1,
		translateY: 0,
	})
		.to(
		[buttons.prev, buttons.next],
		{
			duration: 0.4,
			opacity: 1,
			pointerEvents: "all",
		},
		"-=0.4"
	);
}

const waitForImages = () => {
	const images = [...document.querySelectorAll("img")];
	const totalImages = images.length;
	let loadedImages = 0;
	const loaderEl = document.querySelector(".loader span");

	gsap.set(cardsContainerEl.children, {
		"--card-translateY-offset": "30px",
	});
	gsap.set(cardInfosContainerEl.querySelector(".current--info").querySelectorAll(".text"), {
		translateY: "40px",
		opacity: 1,
	});
	gsap.set([buttons.prev, buttons.next], {
		pointerEvents: "none",
		opacity: "0",
	});

	images.forEach((image) => {
		imagesLoaded(image, (instance) => {
			if (instance.isComplete) {
				loadedImages++;
				let loadProgress = loadedImages / totalImages;

				gsap.to(loaderEl, {
					duration: 1,
					scaleX: loadProgress,
					backgroundColor: `hsl(${loadProgress * 120}, 100%, 50%`,
				});

				if (totalImages == loadedImages) {
					gsap.timeline()
						.to(".loading__wrapper", {
						duration: 0.8,
						opacity: 0,
						pointerEvents: "none",
					})
						.call(() => init());
				}
			}
		});
	});
};

waitForImages();
