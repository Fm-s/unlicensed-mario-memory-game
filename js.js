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
const GAME_DIV_ID = "gameContainer";

const gameState = { cards: {}, lockedCards: [], pending: false};
const gameConfig = {deckSize: 0, bombs: 0, shuffles: 0};

const flipCard = (id,timeout = 0) => {
  const card = document.getElementById(CARD_ID_PREFIX + id);
  const newImg = document.createElement("img");
  newImg.src = gameState.cards[id].imgPath;
  newImg.classList.add("rotateY");
  card.appendChild(newImg);
  setTimeout(() => {
    card.firstChild.classList.toggle("rotateY");
    card.lastChild.classList.toggle("rotateY");
  }, timeout);
};

const unflipCard = (id) => {
  const card = document.getElementById(CARD_ID_PREFIX + id);
  card.firstChild.classList.toggle("rotateY");
  card.lastChild.classList.toggle("rotateY");
  setTimeout(() => {
    card.removeChild(card.lastChild);
  }, 300);
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

const replaceLockedCard = (oldIndex, newIndex, newArray) => {
  if(gameState.lockedCards.includes(+oldIndex)){
    newArray.push(newIndex);
    // gameState.lockedCards.splice(gameState.lockedCards.indexOf(+oldIndex),1,newIndex);
  }
};

const deckReCombiner = () => {
  const newDeckOrder = shuffleDeck(gameConfig.deckSize);
  const newCards = {};
  const newLock = [];

  if((gameConfig.bombs + gameConfig.shuffles) > 0) {
    const bombArray = [];
    const shuffleArray = [];

    for(let i=0; i < gameConfig.bombs; i++ ) {
      const randomNumber = Math.round(Math.random()*(newDeckOrder.length-1));
      bombArray.push(newDeckOrder.splice(randomNumber,1).at(0));
    }

    for(let i=0; i < (gameConfig.shuffles); i++ ) {
      const randomNumber = Math.round(Math.random()*(newDeckOrder.length-1));
      shuffleArray.push(newDeckOrder.splice(randomNumber,1).at(0));
    }

    for(prop in gameState.cards){
      if(gameState.cards[prop].type === "bomb"){
        const newBombIndex = bombArray.pop();
        replaceLockedCard(+prop,newBombIndex,newLock);
        newCards[newBombIndex] = {...gameState.cards[prop]};
      }
      if(gameState.cards[prop].type === "shuffle"){
        const newShuffleIndex = shuffleArray.pop();
        replaceLockedCard(+prop,newShuffleIndex,newLock);
        newCards[newShuffleIndex] = {...gameState.cards[prop]};
      }
    }
  }
  const machedPairs = [];
  for(let i=1;i <= gameConfig.deckSize;i++){
    let pair = +gameState.cards[i].pair;
    if(pair && !machedPairs.includes(pair)){
      const newIndex = newDeckOrder.pop();
      const newPair = newDeckOrder.pop();
      replaceLockedCard(i,newIndex,newLock);
      replaceLockedCard(pair,newPair,newLock);
      newCards[newIndex]={...gameState.cards[i], pair: newPair};
      newCards[newPair]={...gameState.cards[pair], pair: newIndex};
      machedPairs.push(pair,i);
    }
  }
  
  gameState.cards = newCards;
  gameState.lockedCards = newLock;
  gameState.lockedCards.forEach(el=>{
    flipCard(el,300);
  })
}

const shuffleCards = () => {
  if(gameState.pending){
    unflipCard(gameState.lockedCards.pop());
    gameState.pending = false;
    lockScreen(500);
    setTimeout(shuffleCards,400);
    return; 
  }
  
  const gameContainer = document.getElementById(GAME_DIV_ID);
  lockScreen(1500)
  gameContainer.childNodes.forEach((el)=>{
    if(el.childNodes.length > 1){
      el.firstChild.classList.toggle("rotateY");
      el.lastChild.classList.toggle("rotateY");
      setTimeout(()=>{
        el.removeChild(el.lastChild);
      },300)
    }
  });
  setTimeout(deckReCombiner,350);
};

const kaboom = () => {}

const cardClicked = (id) => {
  if(gameState.cards[id].type === "shuffle"){
    if (!gameState.lockedCards.includes(id)){
      if((gameConfig.deckSize - gameState.lockedCards.length) <= gameConfig.shuffles){
        gameState.lockedCards.push(id);
        flipCard(id);
        return
      };
      lockScreen(1000);
      flipCard(id);
      setTimeout(shuffleCards,350);
    };
    return;
  }else if(gameState.cards[id].type === "bomb"){
    kaboom()
  }
  
  
  if (gameState.pending) {
    if (!gameState.lockedCards.includes(id)) {
      lockScreen(400);
      flipCard(id);
      if (gameState.cards[id].pair === gameState.lockedCards.at(-1)) {
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
      lockScreen(400);
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

const BOMB_CARD_IMG = "imgs/boo-shuffle.jpg"
const SHUFFLE_CARD_IMG = "imgs/boo-shuffle.jpg"
let imgArray = [];
const getCardImg = (type) => {
  if(type === "bomb") return BOMB_CARD_IMG;

  if(type === "shuffle") return SHUFFLE_CARD_IMG;
  const rndCard = Math.round(Math.random() * (imgArray.length - 1));
  return "imgs/" + imgArray.splice(rndCard,1).at(0) + ".jpg";
};

const pairCards = () => {
  const deck = shuffleDeck(gameConfig.deckSize);
  let traps = gameConfig.bombs + gameConfig.shuffles;
  
  if((gameConfig.deckSize - traps)%2 !== 0){
    traps += 1;
    gameConfig.shuffles += 1;
  }
  
  const cards = {};
  if(traps > 0) {
    for(let i=0; i < gameConfig.bombs; i++ ) {
      const imgPath = getCardImg("bomb");
      const randomNumber = Math.round(Math.random()*(gameConfig.deckSize.length-1));
      cards[deck.splice(randomNumber, 1).at(0)] = {pair: null, type: "bomb", imgPath: imgPath }
    }
    for(let i=0; i < (gameConfig.shuffles); i++ ) {
      const imgPath = getCardImg("shuffle");
      const randomNumber = Math.round(Math.random()*(gameConfig.deckSize.length-1));
      cards[deck.splice(randomNumber, 1).at(0)] = {pair: null, type: "shuffle", imgPath: imgPath }
    }
  }

  while (deck.length > 0) {
    const [pairA, pairB] = deck.splice(0, 2);
    const imgPath = getCardImg();
    cards[pairA] = { pair: pairB, imgPath: imgPath };
    cards[pairB] = { pair: pairA, imgPath: imgPath };
    
  }
  
  return cards;
};

const configGame = (level) => {
  imgArray = [...CARD_IMG_PATH_ARRAY];

  gameState.lockedCards = [];
  gameState.pending = false;
  
  switch(level){
    case 0:
      gameConfig.deckSize = 4;
      gameConfig.bombs = 0;
      gameConfig.shuffles = 0;
      break;
    case 1:
      gameConfig.deckSize = 9;
      gameConfig.bombs = 0;
      gameConfig.shuffles = 1;
      break;
    case 2:
      gameConfig.deckSize = 16;
      gameConfig.bombs = 1;
      gameConfig.shuffles = 1;
      break;
    case 3:
      gameConfig.deckSize = 12;
      gameConfig.bombs = 0;
      gameConfig.shuffles = 2;
    default:
  }

  gameState.cards = pairCards();

  const cardHeight = "calc("+(80 / 4)+"vh - 10px)";
  for (i = 1; i <= gameConfig.deckSize; i++) {
    document.getElementById(GAME_DIV_ID).appendChild(newCard(i, cardHeight));
  }
};

const newGame = (level = 1) => {  
  const gameContainer = document.getElementById(GAME_DIV_ID);
  while (gameContainer.lastChild) {
    gameContainer.removeChild(gameContainer.lastChild);
  }
  configGame(level);
};

const clickFunc = () => {
  deckReCombiner();
};

window.onload = () => {
  newGame(3);
};