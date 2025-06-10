import {
  // loadHeader,
  // loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';
import Reveal from './reveal.esm.js';
import RevealZoom from '../plugin/zoom/zoom.esm.js';
import RevealNotes from '../plugin/notes/notes.esm.js';
import RevealSearch from '../plugin/search/search.esm.js';
import RevealHighlight from '../plugin/highlight/highlight.esm.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const themeLink = document.getElementById('theme');
  let themeSwitcher = document.getElementById('theme-switcher');

  // If decorateMain hasn't run yet, create the theme switcher now
  if (!themeSwitcher) {
    themeSwitcher = document.createElement('select');
    themeSwitcher.id = 'theme-switcher';
    themeSwitcher.style.position = 'fixed';
    themeSwitcher.style.top = '10px';
    themeSwitcher.style.right = '10px';
    themeSwitcher.style.zIndex = '9999';
    const themes = [
      { value: 'league', label: 'League' },
      { value: 'beige', label: 'Beige' },
      { value: 'black', label: 'Black' },
      { value: 'notblood', label: 'Not Blood' },
      { value: 'moon', label: 'Moon' },
      { value: 'night', label: 'Night' },
      { value: 'serif', label: 'Serif' },
      { value: 'simple', label: 'Simple' },
      { value: 'sky', label: 'Sky' },
      { value: 'solarized', label: 'Solarized' },
      { value: 'white', label: 'White' },
    ];
    themes.forEach(({ value, label }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      themeSwitcher.appendChild(option);
    });
    document.body.appendChild(themeSwitcher);
  }

  // set the theme to the meta name="theme" content value
  const theme = document.querySelector('meta[name="theme"]').getAttribute('content');
  themeLink.setAttribute('href', `styles/theme/${theme}.css`);

  // Set the dropdown to the current theme
  const currentTheme = themeLink.getAttribute('href').match(/theme\/([a-z]+)\.css/)[1];
  themeSwitcher.value = currentTheme;

  themeSwitcher.addEventListener('change', () => {
    const newTheme = themeSwitcher.value;
    themeLink.setAttribute('href', `styles/theme/${newTheme}.css`);
    localStorage.setItem('reveal-theme', newTheme);
  });

  // Optionally, restore from localStorage (commented out in your last version)
  // const savedTheme = localStorage.getItem('reveal-theme');
  // if (savedTheme && savedTheme !== currentTheme) {
  //   themeLink.setAttribute('href', `styles/theme/${savedTheme}.css`);
  //   themeSwitcher.value = savedTheme;
  // }
});

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function decorateReveal() {
  const main = document.body.querySelector('main');
  main.classList.add('reveal');
  const slides = document.createElement('div');
  slides.classList.add('slides');
  slides.innerHTML = main.innerHTML;
  main.replaceChildren();
  main.appendChild(slides);

  // Treat links that contain an href that starts with http://attribute as attributes
  // Decorate the parent element with the attributes and remove the achor tag
  main.querySelectorAll("[href^='http://attribute']").forEach((link) => {
    const parent = link.parentNode;
    const attributes = link.href.replace('http://attribute/?', '').split('&');
    attributes.forEach((attribute) => {
      const [key, value] = attribute.split('=');
      parent.setAttribute(key, decodeURI(value));
    });
    parent.innerHTML = link.innerHTML;
  });

  // Use line numbers on any code blocks.. assume javascript
  main.querySelectorAll('code').forEach((code) => {
    code.setAttribute('data-line-numbers', '');
    code.classList.add('language-javascript');
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);

  // Dynamically add the Theme Switcher dropdown if not already present
  if (!document.getElementById('theme-switcher')) {
    const themeSwitcher = document.createElement('select');
    themeSwitcher.id = 'theme-switcher';
    themeSwitcher.style.position = 'fixed';
    themeSwitcher.style.top = '10px';
    themeSwitcher.style.right = '10px';
    themeSwitcher.style.zIndex = '9999';
    const themes = [
      { value: 'league', label: 'League' },
      { value: 'beige', label: 'Beige' },
      { value: 'black', label: 'Black' },
      { value: 'blood', label: 'Blood' },
      { value: 'moon', label: 'Moon' },
      { value: 'night', label: 'Night' },
      { value: 'serif', label: 'Serif' },
      { value: 'simple', label: 'Simple' },
      { value: 'sky', label: 'Sky' },
      { value: 'solarized', label: 'Solarized' },
      { value: 'white', label: 'White' },
    ];
    themes.forEach(({ value, label }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      themeSwitcher.appendChild(option);
    });
    document.body.appendChild(themeSwitcher);
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  decorateReveal();
  Reveal.initialize({
    controls: true,
    progress: true,
    center: true,
    hash: true,
    transition: 'convex',
    // Learn about plugins: https://revealjs.com/plugins/
    plugins: [RevealZoom, RevealNotes, RevealSearch, RevealHighlight],
  });
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  // loadHeader(doc.querySelector('header'));
  // loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  // loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
