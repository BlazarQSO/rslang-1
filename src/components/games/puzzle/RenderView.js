import { modifySentence, shuffleSentence } from './RoundData/modifySentence';
import volumeImg from '../../../assets/img/volume.svg';
import soundTip from '../../../assets/img/puzzle/speaker.svg';
import backTip from '../../../assets/img/puzzle/photo.svg';
import textTip from '../../../assets/img/puzzle/text.svg';
import playTip from '../../../assets/img/puzzle/sound.svg';
import { createElement } from '../../../utils';

export default class RenderView {
  constructor(root, data, containerWidth, containerHeight) {
    this.root = root;
    this.data = data;
    this.row = null;
    this.containerHeight = containerHeight;
    this.containerWidth = containerWidth;
    this.rowHeight = containerHeight / 10; /*  10 - sentences number */
    this.puzzleContainer = null;
    this.wordContainer = null;
    this.sentenceTranslation = null;
  }

  modifyData() {
    let offsetY = 0;
    Object.values(this.data.sentences).forEach((el) => {
      const modified = modifySentence(el.textExample, this.containerWidth, this.rowHeight);
      Object.values(modified).forEach((word) => {
        const currentWord = word;
        currentWord.offsetY = offsetY;
      });
      const shuffled = shuffleSentence(modified);
      const currentEl = el;
      currentEl.splitted = modified;
      currentEl.shuffled = shuffled;
      offsetY += this.rowHeight;
    });
  }

  renderMainLayout() {
    this.root.innerHTML = `
      <div class="container">
        <div class="control-block">
        <a class="btn btn__exit" href="#/">Exit</a>
        <div class="btn__block">
          <button class="btn btn__icon btn__backImg"><img src=${backTip} class="tip"><span class="tooltiptext">Click to toggle background images of puzzles in next step</span></button>
          <button class="btn btn__icon btn__audio__tip"><img src=${soundTip} class="tip"><span class="tooltiptext">Click to toggle audio tip in next step</span></button>
          <button class="btn btn__icon btn__translate"><img src=${textTip} class="tip"><span class="tooltiptext">Click to toggle sentence translation in next step</span></button>
          <select class="btn select-level">
            <option value="0">Level 1</option>
            <option value="1">Level 2</option>
            <option value="2">Level 3</option>
            <option value="3">Level 4</option>
            <option value="4">Level 5</option>
            <option value="5">Level 6</option>
          </select>
          <select class="btn select-round"></select>
          <button class="btn btn__select">Select round</button>
          <button class="btn btn__userwords">User words</button>
        </div>
        <div class="btn__audio__wrapper"><button class="btn btn__icon btn__audio"><img src=${playTip} class="tip"><span class="tooltiptext">Click to play audio pronounce of current sentence</span></button></div>
        <div class="sentence-translation"></div>
        </div>
        <div class="puzzle-container"></div>
        <div class="word-container"></div>
        <div class="control-block">
          <div class="btn__block btn__block_bottom">
            <button class="btn btn__check">Check</button>
            <button class="btn btn__continue">Continue</button>
            <button class="btn btn__idk">I don't know</button>
          </div>
        </div>
      </div>
    `;

    let maxroundNumber = 25;
    while (maxroundNumber) {
      const option = document.createElement('option');
      option.setAttribute('value', maxroundNumber);
      option.innerText = `Round ${maxroundNumber}`;
      this.root.querySelector('.select-round').append(option);
      maxroundNumber -= 1;
    }

    this.puzzleContainer = this.root.querySelector('.puzzle-container');
    this.wordContainer = this.root.querySelector('.word-container');
    this.sentenceTranslation = this.root.querySelector('.sentence-translation');
    this.wordContainer.style.width = `${this.containerWidth + 100}px`;
    this.wordContainer.style.height = `${this.rowHeight + 20}px`;
    this.puzzleContainer.style.width = `${this.containerWidth}px`;
    this.puzzleContainer.style.height = `${this.containerHeight}px`;

    this.markElements();
  }

  markElements() {
    if (this.data.isUserWords) {
      this.root.querySelector('.btn__userwords').classList.add('chosen');
    }

    this.root.querySelector('.select-round').querySelectorAll('option').forEach((el) => {
      if (parseInt(el.value, 0) === this.data.roundNumber) {
        el.setAttribute('selected', 'true');
      }
    });

    this.root.querySelector('.select-level').querySelectorAll('option').forEach((el) => {
      if (parseInt(el.value, 0) === this.data.level) {
        el.setAttribute('selected', 'true');
      }
    });

    if (!this.data.tips.backImg) {
      this.root.querySelector('.btn__backImg').classList.add('inactive');
    }

    if (!this.data.tips.translate) {
      this.root.querySelector('.btn__translate').classList.add('inactive');
    }

    if (!this.data.tips.autoPlay) {
      this.root.querySelector('.btn__audio__tip').classList.add('inactive');
      this.root.querySelector('.btn__audio').style.display = 'none';
    }
  }

  renderRow() {
    this.row = document.createElement('div');
    this.row.classList.add('row');
    this.row.style.height = `${this.rowHeight}px`;
    this.row.style.outline = '2px dotted gray';

    return this.row;
  }

  renderWord(wordData) {
    this.word = document.createElement('div');
    this.word.classList.add('word', 'draggable');
    this.word.innerHTML = `<span>${wordData.word}</span>`;
    this.word.style.width = `${wordData.width}px`;
    this.word.style.height = `${this.rowHeight}px`;
    this.word.style.background = `url(${this.data.cutRoundImg}) no-repeat`;
    this.word.style.backgroundPosition = `-${wordData.offsetX}px -${wordData.offsetY}px`;
    this.word.style.backgroundSize = `${this.containerWidth}px ${this.containerHeight}px`;
    return this.word;
  }

  renderResult(sentenceData, fails) {
    this.resultWindow = document.createElement('div');
    this.resultWindow.classList.add('result-window');
    this.resultWindow.innerHTML = `
      <div class="result-modal">
        <div class="result-modal__painting">
          <img class="result-modal__image" src=${sentenceData.roundImg} alt="round-image">
          <p class="result-modal__title">${sentenceData.roundImgData.author}, ${sentenceData.roundImgData.name} (${sentenceData.roundImgData.year}) </p>
        </div>
        <div class="result-modal__info">
          <h2>I don't know - ${fails}</h2>
          <div class="dont-know"></div>
          <h2>I know - ${10 - fails}</h2>
          <div class="know"></div>
        </div>
        <div class="result-modal__btn">
          <button class="btn btn__continue__modal">Continue</button>
          <button class="btn btn__statistics__modal">Statistics</button>
        </div>
      </div>
    `;
    Object.values(sentenceData.sentences).forEach((el) => {
      const resultSentence = document.createElement('div');
      resultSentence.classList.add('result-sentence');
      resultSentence.innerHTML = `
      <img src=${volumeImg} alt="sound">
      <p>${el.textExample}</p>
      `;
      resultSentence.addEventListener('click', () => {
        const audio = new Audio(`${el.audio}`);
        audio.play();
      });
      if (el.success === true) {
        this.resultWindow.querySelector('.dont-know').append(resultSentence);
      } else {
        this.resultWindow.querySelector('.know').append(resultSentence);
      }
    });
    return this.resultWindow;
  }

  renderPreloader() {
    this.preloader = createElement({ tag: 'div', class: 'loading' });
    this.preloader.innerHTML = `
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
    `;
    this.root.append(this.preloader);
  }

  appendtranslation(translation) {
    this.sentenceTranslation.innerHTML = translation;
  }

  showError(error) {
    const msg = document.createElement('div');
    msg.classList.add('msg');
    msg.innerText = error;
    this.root.append(msg);

    setTimeout(msg.remove(), 1000);
  }

  init() {
    this.modifyData();
    this.renderMainLayout();
  }
}