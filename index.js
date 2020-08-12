let time = 0;
let score = 0;
let isStartTyping = false;
let isInSentenceMode = false;
let levelDivider;
let timer = undefined;
let isCountdownStart = false;
let selectedLevel = undefined;
let firstIteration = true;

const wordInput = document.querySelector('#word-input');
const currentWord = document.querySelector('#current-word');
const scoreDisplay = document.querySelector('#score');
const highScore = document.querySelector('#high-score');
const timeDisplay = document.querySelector('#time');
const message = document.querySelector('#message');
const seconds = document.querySelector('#seconds');
const wordMode = document.querySelector("#word_mode");
const sentenceMode = document.querySelector("#sentence_mode");
const tryAgain = document.querySelector("#try-again");
const easyMode = document.querySelector("#easy");
const mediumMode = document.querySelector("#medium");
const hardMode = document.querySelector("#hard");

wordMode.addEventListener('click', ()=> { selectMode('word'); })
sentenceMode.addEventListener('click', ()=> { selectMode('sentence'); })

easyMode.addEventListener('click', () => selectLevel('Easy'));
mediumMode.addEventListener('click', () => selectLevel('Medium'));
hardMode.addEventListener('click', () => selectLevel('Hard'));

wordInput.addEventListener('input', startMatch);
tryAgain.addEventListener('click', () => {
    location.reload();
    return false;
});

function init () {
    if(firstIteration) {
        selectLevel(null);
        selectMode(null);
    }
    showHighScore();

    score = 0;
    scoreDisplay.innerHTML = '0';
    timeDisplay.innerText = '..';
    time = null;

    showWord();

    firstIteration = false;
}

function selectLevel(level) {
    if(level === null) {
        if(localStorage.getItem('currentLevel')) level = localStorage.getItem('currentLevel');
        else level = 'Easy';
    }

    if(level === 'Easy') levelDivider = 2;
    else if(level === 'Medium') levelDivider = 2.5;
    else levelDivider = 3;

    level === 'Easy' ? easyMode.classList.add('levelModeActive') : easyMode.classList.remove('levelModeActive');
    level === 'Medium' ? mediumMode.classList.add('levelModeActive') : mediumMode.classList.remove('levelModeActive');
    level === 'Hard' ? hardMode.classList.add('levelModeActive') : hardMode.classList.remove('levelModeActive');

    localStorage.setItem('currentLevel', level);
    isStartTyping = false;
    selectedLevel = level;
    isCountdownStart = false;

    if(!firstIteration) init();
}

function selectMode(mode) {
    if(mode === null) {
        if(localStorage.getItem('isInSentenceMode')) {
            if(localStorage.getItem('isInSentenceMode') === 'true') mode = 'sentence';
            else mode = 'word';
        }
    }
    mode === 'word' ? wordMode.classList.add('active') : wordMode.classList.remove('active');
    mode === 'word' ? localStorage.setItem('isInSentenceMode', 'false') : localStorage.setItem('isInSentenceMode', 'true');
    mode === 'sentence' ? sentenceMode.classList.add('active') : sentenceMode.classList.remove('active');
    mode === 'sentence' ? isInSentenceMode = true : isInSentenceMode = false;

    if(timer) clearInterval(timer);
    isStartTyping = false;
    isCountdownStart = false;


    if(!firstIteration) init();
}

async function showWord() {
    if(isInSentenceMode) fetchUrl = 'https://api.quotable.io/random';
    else fetchUrl = 'https://random-word-api.herokuapp.com/word?number=1';
    let word = await fetch(fetchUrl)
        .then(res => res.json())
        .then(word => word)
    if(isInSentenceMode) word = word.content;
    else word = String(word);
    currentWord.innerHTML = '';
    time = Math.round(word.length / levelDivider);
    seconds.innerHTML = time.toString();
    word.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        currentWord.appendChild(characterSpan);
    })
}

function countdown() {
    if(isStartTyping) {
        if(time > 0) time--;
        timeDisplay.innerHTML = time;
        if(time === 0) {
            message.innerHTML = 'Game Over';
            tryAgain.innerHTML = 'Try Again?';
            let mode = 'highScore' + (isInSentenceMode ? 'Sentence' : 'Word') + selectedLevel;
            if(isInSentenceMode) {
                if(!localStorage.getItem(mode) || score > parseInt(localStorage.getItem(mode)))
                    localStorage.setItem(mode, score.toString());
            }

            else {
                if(!localStorage.getItem(mode) || score > parseInt(localStorage.getItem(mode)))
                localStorage.setItem(mode, score.toString());
            }
            score = 0;
            wordInput.disabled = true;
            if(timer) clearInterval(timer);
        }
    }
}

function startMatch() {
    isStartTyping = true;
    if(!isCountdownStart) {
        timer = setInterval(countdown, 1000);
    }
    isCountdownStart = true;
    if(matchWords()) {
        time = 0;
        showWord();
        wordInput.value = '';
        score++;
    }
    scoreDisplay.innerHTML = score;
}

function matchWords() {
    const currentWordSpan = currentWord.querySelectorAll('span');
    const typedWordInput = wordInput.value.split('');
    let correct = true;
    currentWordSpan.forEach((characterSpan, index) => {
        const character = typedWordInput[index];
        if(character == null) {
            characterSpan.classList.remove('correct');
            characterSpan.classList.remove('incorrect');
            correct = false;
        }
        else if(character === characterSpan.innerText) {
            characterSpan.classList.add('correct');
            characterSpan.classList.remove('incorrect');
        } else {
            characterSpan.classList.remove('correct');
            characterSpan.classList.add('incorrect');
            correct = false;
        }
    })
    if(correct) {
        message.innerHTML = 'Correct!!!';
        currentWord.innerText = '.....';
        isStartTyping = false;
        timeDisplay.innerText = '..';
        if(timer) clearInterval(timer);
        isCountdownStart = false;
        return true;
    } else {
        message.innerHTML = '';
        return false;
    }
}

function showHighScore() {
    let mode = 'highScore' + (isInSentenceMode ? 'Sentence' : 'Word') + selectedLevel;
    if(localStorage.getItem(mode)) highScore.innerText = localStorage.getItem(mode);
    else highScore.innerText = '..';
}

init();
