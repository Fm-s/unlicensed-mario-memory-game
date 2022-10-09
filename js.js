const CARD_IMG_PATH_ARRAY = [
  "yoshi-yellow",
  "yoshi-red",
  "yoshi-purple",
  "yoshi-cyan",
  "yoshi-green",
  "yosh-island",
  "toad-arms-waist",
  "toad-hi",
  "toad-yay",
  "peach-umbrela",
  "peach-bye",
  "mario-yosh",
  "mario-yay",
  "mario-snes-jump",
  "mario-party",
  "mario-luigi",
  "mario-hands-up",
  "mario-gogles",
  "luigi-yosh",
  "luigi-look",
  "luigi-jump",
  "luigi-greet",
  "luigi-arm-crossed",
  "daisy-yay",
  "daisy-strech",
  "daisy-hands-hip",
  "bombete-cute",
  "browser-junior",
  "browser-arms-crossed",
]; //29 total de pares = 58 cards
const CARD_ID_PREFIX = "card_";

const gameState = { cards: {}, lockedCards: [], pending: false };

const flipCard = (id) => {
  const card = document.getElementById(CARD_ID_PREFIX + id);
  const newImg = document.createElement("img");
  newImg.src = gameState.cards[id].imgPath;
  newImg.classList.add("rotateY");
  card.appendChild(newImg);
  setTimeout(() => {
    card.firstChild.classList.toggle("rotateY");
    card.lastChild.classList.toggle("rotateY");
  }, 100);
};

const unflipCard = (id) => {
  const card = document.getElementById(CARD_ID_PREFIX + id);
  card.firstChild.classList.toggle("rotateY");
  card.lastChild.classList.toggle("rotateY");
  setTimeout(() => {
    card.removeChild(card.lastChild);
  }, 600);
};

const SCREEN_LOCK_CSS_CLASS = "screenLock";
const lockScreen = (timeout) => {
  const lock = document.createElement("div");
  lock.classList.add(SCREEN_LOCK_CSS_CLASS);
  document.getElementsByTagName("body")[0].appendChild(lock);
  setTimeout(() => {
    document.getElementsByTagName("body")[0].removeChild(lock);
  }, timeout);
};

const cardClicked = (id) => {
  lockScreen(400);
  if (gameState.pending) {
    if (!gameState.lockedCards.includes(id)) {
      flipCard(id);
      if (gameState.cards[id].pair === gameState.lockedCards[gameState.lockedCards.length - 1]) {
        gameState.lockedCards.push(id);
      } else {
        lockScreen(1500);
        setTimeout(() => {
          unflipCard(id);
          unflipCard(gameState.lockedCards.pop());
        }, 1000);
      }
      gameState.pending = false;
    }
  } else {
    if (!gameState.lockedCards.includes(id)) {
      gameState.lockedCards.push(id);
      gameState.pending = true;
      flipCard(id);
    }
  }
};

const CARD_BACK_IMG = "imgs/card-back.png";
const CARD_CSS_CLASS = "gameCard";
const newCard = (id, cardHeight) => {
  const cardBack = CARD_BACK_IMG;
  const cardElement = document.createElement("div");
  cardElement.style.height = cardHeight;
  cardElement.style.width = cardElement.style.height;
  cardElement.classList.add(CARD_CSS_CLASS);
  cardElement.id = CARD_ID_PREFIX + id;
  cardElement.onclick = () => {cardClicked(id)};
  const backImg = document.createElement("img");
  backImg.src = cardBack;
  backImg.alt = "Card Back";
  cardElement.appendChild(backImg);
  return cardElement;
};

const shuffleDeck = (deckSize) => {
  const cardDeck = [];
  let increment = 1;
  
  const cardPlacer = (card,position) => {
    if( position < 0  || position >= deckSize) {
      increment *= -1;
      const newPosition = position + increment * 2;
      cardPlacer (card, newPosition);
      return;
    }
    if(!cardDeck[position]) {
      cardDeck[position] = card;
      return;
    }
    const newPosition = position + increment;
    cardPlacer (card, newPosition);
  }
  
  for (let i = 1; i <= deckSize; i++) {
    const RandomNumber = Math.round(Math.random() * (deckSize - 1));
    cardPlacer(i, RandomNumber, 1);
  }
  return cardDeck;
};

let cardArray = [];
const getCardImg = () => {
  const rndCard = Math.round(Math.random() * (cardArray.length - 1));
  return "imgs/" + cardArray.splice(rndCard,1) + ".jpg";
};

// Implementar Bombas, shuffles e segurança de paridade
const makeCardDeck = (nbrOfCards, nbrOfBombs = 0, nbrOfShuffles = 0) => {
  const matchedPairs = shuffleDeck(nbrOfCards);
  const cards = {};
  while (matchedPairs.length > 0) {
    const [pairA, pairB] = matchedPairs.splice(0, 2);
    const imgPath = getCardImg();
    cards[pairA] = { pair: pairB, imgPath: imgPath };
    cards[pairB] = { pair: pairA, imgPath: imgPath };
  }
  return cards;
};

const makeGameBoard = ({ row, column, divId, gameSt = gameState, nbrOfBombs = 0, nbrOfShuffles = 0 }) => {
  const cardHeight = "calc("+(80 / row)+"vh - 10px)";
  
  
  let numberOfCards = row * column;
  if (typeof numberOfCards !== "number" || numberOfCards < 4) {
    numberOfCards = 4;
  }
  
  for (i = 1; i <= numberOfCards; i++) {
    // Call makeCardDiv Function to create Card Div elements with Ids and Sizes
    document.getElementById(divId).appendChild(newCard(i, cardHeight));
  }
  
  // Manipulate the Global Game State with the Matched and Populate deck
  gameSt.cards = makeCardDeck(numberOfCards, nbrOfBombs, nbrOfShuffles);
};

// Clear old game and Make New one
const newGame = (row, column, divId = "gameContainer") => {
  // Reset State e Card Array
  cardArray = [...CARD_IMG_PATH_ARRAY];
  gameState.lockedCards = [];
  gameState.pending = false;

  // Empty Game Container
  const gameContainer = document.getElementById(divId);
  while (gameContainer.lastChild) {
    gameContainer.removeChild(gameContainer.lastChild);
  }

  // Make New Board
  makeGameBoard({ row: row, column: column, divId: divId });
};

const clickFunc = () => {
  newGame(4, 4);
};

window.onload = () => {
  newGame(4, 4);
};