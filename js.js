const CARD_IMG_PATH_ARRAY = ["yoshi-yellow",
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
const CARD_BACK_IMG = "card-back.png";

let cardArray = [];

const gameState = { cards: {}, lockedCards: [], pending: false };

const lockScreen = (timeout) => {
  const lock = document.createElement("div");
  lock.classList.add("screenLock");
  document.getElementsByTagName("body")[0].appendChild(lock);
  setTimeout(() => {
    document.getElementsByTagName("body")[0].removeChild(lock);
  }, timeout);
};

//Implementar
const getCardImg = (type) => {
  const rndCard = Math.round(Math.random() * (cardArray.length - 1));
  return "imgs/" + cardArray.splice(rndCard,1) + ".jpg";
};

const makeCardOrder = (nbrOfCards) => {
  const cardOrder = [];
  
  for (let i = 0; i < nbrOfCards; i++) {
    uniquePositionBackWard(cardOrder, i, Math.round(Math.random() * (nbrOfCards - 1)));
  }

  return cardOrder;

  function uniquePositionBackWard(cardOrder, id, pos) {
    if (id === 0) {
      id = nbrOfCards;
    }
    if (pos < 0) {
      return uniquePositionFoward(cardOrder, id, pos + 1);
    }
    if (!cardOrder[pos]) {
      return (cardOrder[pos] = id);
    }
    return uniquePositionBackWard(cardOrder, id, pos - 1);
  }

  function uniquePositionFoward(cardOrder, id, pos) {
    if (pos >= cardOrder) {
      return uniquePositionBackWard(cardOrder, id, pos - 1);
    }
    if (!cardOrder[pos]) {
      return (cardOrder[pos] = id);
    }
    return uniquePositionFoward(cardOrder, id, pos + 1);
  }
};

// Implementar Bombas, shuffles e segurança de paridade
const makeCardDeck = (nbrOfCards, nbrOfBombs = 0, nbrOfShuffles = 0) => {
  const matchedPairs = makeCardOrder(nbrOfCards);
  const cards = {};
  while (matchedPairs.length > 0) {
    const [pairA, pairB] = matchedPairs.splice(0, 2);
    const imgPath = getCardImg();
    cards[pairA] = { pair: pairB, imgPath: imgPath };
    cards[pairB] = { pair: pairA, imgPath: imgPath };
  }
  return cards;
};

//Uses Global gameState as non-explicit dependency
const flipCard = (id) => {
  const card = document.getElementById("card_" + id);
  const newImg = document.createElement("img");
  newImg.src = gameState.cards[id].imgPath;
  newImg.classList.add("rotateY");
  card.appendChild(newImg);
  setTimeout(() => {
    card.firstChild.classList.toggle("rotateY");
    card.lastChild.classList.toggle("rotateY");
  }, 0);
};

const unflipCard = (id) => {
  const card = document.getElementById("card_" + id);
  card.firstChild.classList.toggle("rotateY");
  card.lastChild.classList.toggle("rotateY");
  setTimeout(() => {
    card.removeChild(card.lastChild);
  }, 600);
};

//Usa como dependecia não explicita a Global gameState
const cardClicked = (id) => {
  // Preventes Windows click for 400ms
  lockScreen(400);
  if (gameState.pending) {
    if (!gameState.lockedCards.includes(id)) {
      flipCard(id);
      if (gameState.cards[id].pair === gameState.lockedCards[gameState.lockedCards.length - 1]) {
        gameState.lockedCards.push(id);
      } else {
        lockScreen(1100);
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

//Create Div with back card Image and size (uses CARD_BACK_IMG global)
const makeCardDiv = (id, column, row) => {
  
  //const containerWidth = document.getElementById(divId).clientWidth;
  const newElement = document.createElement("div");
  
  newElement.style.height = "calc("+(80 / row)+"vh - 10px)";
  // newElement.style.width = (containerWidth / column) - 15 + "px";
  newElement.style.width = newElement.style.height;
  //newElement.style.height = newElement.style.width;
  newElement.classList.add("gameCard");

  newElement.id = "card_" + id;
  newElement.onclick = cardClicked.bind(null, id);

  const backImg = document.createElement("img");
  backImg.src = "imgs/" + CARD_BACK_IMG;
  backImg.alt = CARD_BACK_IMG;

  newElement.appendChild(backImg);

  return newElement;
};

//Construct`s everything, Cards, Matches, append to div
const makeGameBoard = ({ row, column, divId, gameSt = gameState, nbrOfBombs = 0, nbrOfShuffles = 0 }) => {
  let numberOfCards = row * column;
  if (typeof numberOfCards !== "number" || numberOfCards < 4) {
    numberOfCards = 4;
  }
  
  for (i = 1; i <= numberOfCards; i++) {
    // Call makeCardDiv Function to create Card Div elements with Ids and Sizes
    document.getElementById(divId).appendChild(makeCardDiv(i, column, row));
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