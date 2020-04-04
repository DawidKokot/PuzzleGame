const board = document.getElementById("board");
const boardSize = Math.floor(board.clientWidth);

board.style.height = `${boardSize}px`;
board.style.width = `${boardSize}px`;

// BUTTONS
const lvl = document.querySelector("#level");
const lessBtn = document.querySelector("#less");
const moreBtn = document.querySelector("#more");
const nextBtn = document.querySelector("#nextBtn button");
const strictBtn = document.querySelector("#strictModeBtn button");

const movesEl = document.getElementById("moves");

let strictModePressed = false;
let strictMode;

function strictModeSwitch() {
  strictBtn.classList.toggle("strictModeOn");
  strictModePressed = !strictMode;
}

strictBtn.addEventListener("click", strictModeSwitch);

moreBtn.addEventListener("click", function() {
  if (lvl.value < 10) lvl.value = lvl.value - 1 + 2;
});
lessBtn.addEventListener("click", function() {
  if (lvl.value > 2) lvl.value = lvl.value - 1;
});
nextBtn.addEventListener("click", generator);

// ***************** PREVIEW **************************
function addPreview(pictureID) {
  const previewEl = document.createElement("div");
  previewEl.id = "preview";
  previewEl.style.backgroundImage = `url(https://picsum.photos/id/${pictureID}/${boardSize})`;
  previewEl.style.display = "none";
  board.appendChild(previewEl);
}

function showPreview(e) {
  if (e.keyCode === 80) {
    const previewEl = document.getElementById("preview");
    previewEl.style.display = "block";
  }
}

function hidePreview(e) {
  if (e.keyCode === 80) {
    const previewEl = document.getElementById("preview");
    previewEl.style.display = "none";
  }
}

// ***************** TIMER **************************
const minEl = document.getElementById("minutes");
const secEl = document.getElementById("seconds");
const milisecEl = document.getElementById("miliseconds");
let Timer;

function TimerStart() {
  //timer reset
  minEl.textContent = "0";
  secEl.textContent = "00";
  milisecEl.textContent = "00";

  const startTime = new Date().getTime();

  Timer = setInterval(function() {
    let currTime = new Date().getTime();

    secEl.textContent = (
      "0" +
      (Math.floor((currTime - startTime) / 1000) % 60)
    ).substr(-2);
    milisecEl.textContent = (
      "0" +
      (Math.floor((currTime - startTime) / 10) % 100)
    ).substr(-2);
    minEl.textContent = Math.floor((currTime - startTime) / 60000);
  }, 10);
}

//get random pic iD
function generatePicID() {
  let pictureID = Math.floor(Math.random() * 700);

  //list of known invalid IDs
  const invalidIDs = [
    86,
    207,
    286,
    303,
    346,
    438,
    462,
    463,
    470,
    540,
    589,
    601,
    644,
    647,
    673,
    697
  ];

  if (invalidIDs.includes(pictureID)) {
    console.log(`invalid random ID: pictureID`);
    pictureID = Math.floor(Math.random() * 500);
  }
  return pictureID;
}
//inserting images into the board
function createDivs(imgPerRow, initialOrder, pictureID) {
  const imgCount = imgPerRow * imgPerRow;
  const imgSize = boardSize / imgPerRow;
  for (let i = 0; i < imgCount; i++) {
    let newEl = document.createElement("div");
    newEl.classList.add("img");
    newEl.id = `im-${i}`;
    newEl.style.width = `${imgSize}px`;
    newEl.style.height = `${imgSize}px`;
    newEl.style.backgroundImage = `url(https://picsum.photos/id/${pictureID}/${boardSize}/${boardSize})`;
    newEl.style.order = initialOrder[i]; //setting initial random order
    newEl.draggable = true;
    board.appendChild(newEl);
  }
}

//adjusting images positions
function imgShift(images, imgPerRow) {
  let imgCounter = 0;
  const shift = boardSize / imgPerRow;
  for (let column = 0; column < imgPerRow; column++) {
    for (let row = 0; row < imgPerRow; row++) {
      let positionX = row * shift;
      let positionY = column * shift;
      images[
        imgCounter
      ].style.backgroundPosition = `-${positionX}px -${positionY}px`;
      imgCounter++;
    }
  }
}

function setBodyBackground(pictureID) {
  const w = Math.ceil(window.innerWidth * 0.8); //to reduce background img size
  const h = Math.ceil(window.innerHeight * 0.8);
  const body = document.querySelector("body");
  body.style.backgroundImage = `url(https://picsum.photos/id/${pictureID}/${w}/${h})`;
}

//****************ARRAY FUNCTIONS *********************** */
//function to check if an array of numbers 0,1,...array.length-1 is mixed
function ArrMixed(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] != i) return true;
  }
  return false;
}
//function generates random array with given length and random numbers from 0 to that length-1 without repetitions
function randArr(len) {
  let result = [];
  while (result.length < len - 1) {
    let randomNum = Math.floor(Math.random() * len);
    if (!result.includes(randomNum) && randomNum != result[result.length - 1]) {
      result.push(randomNum);
    }
  }
  //last one doesn't need to be random
  orderedArray = Array.from(Array(len), (_, i) => i);
  const missingNum = orderedArray.filter(x => !result.includes(x))[0];
  result.push(missingNum);

  return result;
}
//generating the initialOrder  ( until it's different then natural)
function initialOrderGenerator(len) {
  let initialOrder = [];
  do {
    initialOrder = randArr(len);
  } while (!ArrMixed(initialOrder));

  return initialOrder;
}
//**************************************** */

function isCorrect() {
  const images = document.querySelectorAll(".img");
  // correct
  if ([].every.call(images, img => img.style.order === img.id.substr(3))) {
    board.className = "correctOrder";
    //Top Times
    addTopTime(
      {
        minutes: minEl.textContent,
        seconds: secEl.textContent,
        miliseconds: milisecEl.textContent
      },
      lvl.value
    );
    gameOver();
  }
  //game over in strict mode
  else if (strictMode && parseInt(movesEl.textContent) == 0) {
    board.className = "gameOverOrder";
    gameOver();
  }
}

//stopping most functions
function gameOver() {
  const images = document.querySelectorAll(".img");
  clearInterval(Timer);

  {
    //turn off preview
    window.removeEventListener("keyup", hidePreview);
    window.removeEventListener("keydown", showPreview);
    const previewEl = document.getElementById("preview");
    previewEl.style.display = "block";
  }

  images.forEach(img => (img.draggable = false)); //this doesn't work for some reason?;/
  images.forEach(img => {
    //removing drag events from every image
    img.removeEventListener("dragstart", dragStartHandler);
    img.removeEventListener("dragenter", dragEnterHandler);
    img.removeEventListener("dragleave", dragLeaveHandler);
    img.removeEventListener("dragover", dragOverHandler);
    img.removeEventListener("drop", dragDropHandler);
  });
}

/* ****************************************************** */
/* ***************BEST TIMES***************************** */

let currentLvlDisplay = 2;

//adds best times lists to the dom
(function() {
  const listsContainer = document.getElementById("bestTimesLists");
  for (let lvl = 2; lvl <= 10; lvl++) {
    const newListEl = document.createElement("div");
    const headerEl = document.createElement("h2");
    const newUlEl = document.createElement("ul");
    newListEl.id = `bestTimesLvl${lvl}`;
    newListEl.classList.add("bestTimesList");
    newListEl.style.left = `130px`;
    headerEl.textContent = `${lvl} x ${lvl}`;
    for (let i = 1; i <= 5; i++) {
      const listItem = document.createElement("li");
      listItem.textContent = "0:00:00";
      newUlEl.appendChild(listItem);
    }
    newListEl.appendChild(headerEl);
    newListEl.appendChild(newUlEl);
    listsContainer.appendChild(newListEl);
  }
})();

//displays given level of best times
function showBestTimes(lvl) {
  currentLvlDisplay = lvl;
  const Lists = document.querySelectorAll(".bestTimesList");
  Lists.forEach(list => {
    let listLvl = parseInt(list.id.replace(/[^\d]/g, ""));
    if (listLvl < lvl) {
      list.style.left = "-130px";
    } else if (listLvl > lvl) {
      list.style.left = "130px";
    } else {
      list.style.left = "0px";
    }
  });
}

//Top Times - next btn
function bestTimesNext() {
  if (currentLvlDisplay < 10) {
    currentLvlDisplay++;
  } else {
    currentLvlDisplay = 2;
  }

  showBestTimes(currentLvlDisplay);
}

//Top Times - previous btn
function bestTimesPrevious() {
  if (currentLvlDisplay > 2) {
    currentLvlDisplay--;
  } else {
    currentLvlDisplay = 10;
  }
  showBestTimes(currentLvlDisplay);
}

//top times btns events
const bestTmesBtns = document.querySelectorAll(".bestTimeBtnContainer");
bestTmesBtns[0].addEventListener("click", bestTimesPrevious);
bestTmesBtns[1].addEventListener("click", bestTimesNext);

let flashingNewTime;

//checks if a given time was beaten on given lvl, if yes than adds to top scores
function addTopTime(currentTime, lvl) {
  const { minutes, seconds, miliseconds } = currentTime;
  const bestTimes = document.querySelectorAll(`#bestTimesLvl${lvl} li`);
  for (let i = 0; i < 5; i++) {
    if (
      `${minutes}:${seconds}:${miliseconds}` < bestTimes[i].textContent ||
      bestTimes[i].textContent === "0:00:00"
    ) {
      newTime = document.createElement("li");
      newTime.textContent = `${minutes}:${seconds}:${miliseconds}`;
      document
        .querySelector(`#bestTimesLvl${lvl} ul`)
        .insertBefore(newTime, bestTimes[i]);
      document
        .querySelector(`#bestTimesLvl${lvl} ul`)
        .removeChild(bestTimes[4]);
      localStorage.setItem(
        `bestTimes-${lvl}`,
        Array.from(
          document.querySelectorAll(`#bestTimesLvl${lvl} li`),
          item => item.textContent
        )
      );
      //new Time flashing
      newTime.classList.add("flashingTime");
      flashingNewTime = newTime;
      return;
    }
  }
}

//Getting top times from local storage
(function() {
  for (let lvl = 2; lvl <= 10; lvl++) {
    const currentStorage = localStorage.getItem(`bestTimes-${lvl}`);
    if (currentStorage != null) {
      const currentList = document.querySelectorAll(
        `#bestTimesLvl${lvl} ul li`
      );
      const savedTimes = currentStorage.split(",");

      [].forEach.call(currentList, (time, i) => {
        time.textContent = savedTimes[i];
      });
    }
  }
})();

//delete top times
const deleteBtn = document.getElementById("deleteTimes");
deleteBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete your Top Times?")) {
    localStorage.clear();
    alert("Refresh the page to see the result.");
  }
});

//trophy click event -- showing best times on smaller screens

function showBestTimesTrophy() {
  const bestTimes = document.getElementById("bestTimes");
  bestTimes.style.width = "0";
  bestTimes.style.height = "0";
  bestTimes.style.display = "block";
  showBestTimesAnimation(0);
  setTimeout(() => {
    window.addEventListener("click", hideBestTimes);
  }, 1);
}

const bestTimeWidth = boardSize >= 500 ? 244 : 140;
const bestTimeHeight = boardSize >= 500 ? 205 : 132;
// 300ms - duration of animation
function showBestTimesAnimation(n) {
  if (n <= 300) {
    setTimeout(() => {
      bestTimes.style.width = `${n * (bestTimeWidth / 300)}px`;
      bestTimes.style.height = `${n * (bestTimeHeight / 300)}px`;
    }, n);

    showBestTimesAnimation(n + 1);
  }
}

function hideBestTimesAnimation(n) {
  if (n >= 0) {
    setTimeout(() => {
      bestTimes.style.width = `${n * (bestTimeWidth / 300)}px`;
      bestTimes.style.height = `${n * (bestTimeHeight / 300)}px`;
    }, 300 - n);

    hideBestTimesAnimation(n - 1);
  }
}

function hideBestTimes(e) {
  if (
    e.target.classList[0] == "bestTimeBtnContainer" ||
    e.target.classList[0] == "bestTimesLvlChange"
  )
    return;
  hideBestTimesAnimation(300);
  setTimeout(() => {
    bestTimes.style.display = "none";
  }, 301);
  window.removeEventListener("click", hideBestTimes);
}

const trophy = document.getElementById("trophy");
trophy.addEventListener("click", showBestTimesTrophy);

/* ****************************************************** */
/* ****************************************************** */

function btnFlash() {
  setInterval(() => {
    const images = document.querySelectorAll(".img");
    if ([].every.call(images, img => img.style.order === img.id.substr(3))) {
      nextBtn.classList.toggle("flash");
    }
  }, 600);
}

function updateMoveCounter(e) {
  if (e.target != imgFrom)
    movesEl.textContent = strictMode
      ? parseInt(movesEl.textContent) - 1
      : parseInt(movesEl.textContent) + 1;
}

//function counts how many moves are required to complete the puzzle (at least it's the best way I could think of)
function countMinimal(initialOrder) {
  counter = 0;

  do {
    let currentNum = firstToSort(initialOrder); // [0,2]
    initialOrder[currentNum[1]] = initialOrder[currentNum[0]];
    initialOrder[currentNum[0]] = currentNum[0];
    counter++;
  } while (
    initialOrder.filter((x, i) => x === i).length != initialOrder.length
  );
  return counter;
}

//finding the smallest number which is not on correct position ( element != position). returns [the number, index]
function firstToSort(array) {
  for (let i = 0; i < array.length; i++) {
    let currentPosition = array.findIndex(x => x === i);
    if (currentPosition != i) return [i, currentPosition];
  }
}
//defining Event Handlers
//******************************** */
const dragStartHandler = e => {
  e.target.style.opacity = 0.7;
  e.dataTransfer.setData("text", e.target.style.order);
  imgFrom = e.target;
  if (
    minEl.textContent + secEl.textContent + milisecEl.textContent ===
    "00000"
  ) {
    TimerStart();
  }
};

const dragEnterHandler = e => {
  e.target.classList.add("dragEnter");
};

const dragLeaveHandler = e => {
  e.target.classList.remove("dragEnter");
};

const dragOverHandler = e => {
  e.preventDefault();
};

const dragDropHandler = e => {
  e.preventDefault();
  const order = e.dataTransfer.getData("text");
  e.target.classList.remove("dragEnter");
  imgFrom.style.order = e.target.style.order;
  e.target.style.order = order;
  if (!board.classList.contains("correctOrder")) updateMoveCounter(e);
  isCorrect();
};
const dragEndHandler = e => {
  e.preventDefault();
  e.target.style.opacity = 1.0;
};
// *********************************

//adding Event Handlers
function addEventHandlers(images) {
  images.forEach((img, i) => {
    img.addEventListener("dragstart", dragStartHandler);
    img.addEventListener("dragenter", dragEnterHandler);
    img.addEventListener("dragleave", dragLeaveHandler);
    img.addEventListener("dragover", dragOverHandler);
    img.addEventListener("drop", dragDropHandler);
    img.addEventListener("dragend", dragEndHandler);
  });
}

//  --------------- MAIN (sort of)---------------- //
//refresh puzzle function
function generator() {
  const pictureID = generatePicID();
  if (lvl.value < 2) {
    lvl.value = 2;
  }
  if (lvl.value > 10) {
    lvl.value = 10;
  }
  strictMode = strictModePressed;
  const imgPerRow = lvl.value;
  const initialOrder = initialOrderGenerator(imgPerRow * imgPerRow);
  setBodyBackground(pictureID);
  //board reset
  board.textContent = "";
  board.className = "wrongOrder";
  //timer reset
  minEl.textContent = "0";
  secEl.textContent = "00";
  milisecEl.textContent = "00";
  clearInterval(Timer);
  //inserting images
  createDivs(imgPerRow, initialOrder, pictureID);
  const images = document.querySelectorAll(".img");
  imgShift(images, imgPerRow);
  addEventHandlers(images);
  //adding preview
  addPreview(pictureID);
  window.addEventListener("keydown", showPreview);
  window.addEventListener("keyup", hidePreview);
  //count of moves
  const reqMoves = countMinimal(initialOrder);
  document.getElementById("minimalMoves").textContent = reqMoves;
  document.getElementById("moves").textContent = strictMode ? reqMoves : "0";
  if (strictMode) {
    document.getElementById("moves").classList.add("movesLeft");
  } else {
    document.getElementById("moves").classList.remove("movesLeft");
  }

  //show High Scores relevant to the selected level
  showBestTimes(lvl.value);
  if (flashingNewTime) flashingNewTime.classList.remove("flashingTime");
}

//adding Event to Next button
nextBtn.addEventListener("click", generator);

// btnFlash();
//Main on load:
generator();
