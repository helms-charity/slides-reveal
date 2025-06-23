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
  getMetadata,
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
  const themeSwitcher = document.getElementById('theme-switcher');

  // Get the theme from the meta tag
  const metaTheme = getMetadata('theme');
  // Fallback to the themeLink href if meta is not present
  const currentTheme = metaTheme || themeLink.getAttribute('href').match(/theme\/([a-z]+)\.css/)[1];
  themeSwitcher.value = currentTheme;
  themeLink.setAttribute('href', `styles/theme/${currentTheme}.css`);

  themeSwitcher.addEventListener('change', () => {
    const newTheme = themeSwitcher.value;
    themeLink.setAttribute('href', `styles/theme/${newTheme}.css`);
    localStorage.setItem('reveal-theme', newTheme);
  });

  // On load, check if a theme is saved in localStorage
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

/*  Subsection creation for vertical slides */
export function replaceTildesWithSubSections() {
  const elements = document.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6');
  const tildeRegex = /~~~/g;

  elements.forEach((element) => {
    if (element.innerHTML.includes('~~~')) {
      const nextElementPictureP = element.nextElementSibling;
      nextElementPictureP.parentElement.parentElement.classList.add('has-subsections');

      // Remove nextElementPictureP from its current position in the DOM
      if (nextElementPictureP) {
        nextElementPictureP.parentNode.removeChild(nextElementPictureP);
      }

      // Replace tildes with a placeholder section
      const replacedHTML = element.innerHTML.replace(tildeRegex, '<section class="subsection-placeholder"></section>');
      element.innerHTML = replacedHTML;

      // Find the placeholder section
      const placeholder = element.querySelector('.subsection-placeholder');
      if (placeholder && nextElementPictureP) {
        // Create a new section to contain nextElementPictureP
        const newSection = document.createElement('section');
        newSection.classList.add('subsection');
        newSection.appendChild(nextElementPictureP);

        // Insert the new section as a child of the parent's parent, in place of the placeholder
        const parentOfParent = element.parentElement?.parentElement;
        if (parentOfParent) {
          // eslint-disable-next-line max-len
          parentOfParent.insertBefore(newSection, parentOfParent.children[Array.prototype.indexOf.call(parentOfParent.children, element.parentElement) + 1]);
        }

        // Remove the placeholder from the element
        placeholder.remove();
      }
    }
  });
}

function WrapDefaultContentDivForSubsections() {
  // Find all section elements with the class "has-subsections"
  const sections = document.querySelectorAll('section.has-subsections');
  // eslint-disable-next-line no-restricted-syntax
  for (const section of sections) {
    // Find the first div with class "default-content-wrapper" inside this section
    const defaultContentDiv = section.querySelector('div.default-content-wrapper');
    if (defaultContentDiv) {
      // Create a new section element
      const wrapperSection = document.createElement('section');
      // Move the defaultContentDiv inside the new section
      defaultContentDiv.parentNode.insertBefore(wrapperSection, defaultContentDiv);
      wrapperSection.appendChild(defaultContentDiv);
    }
  }
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
  replaceTildesWithSubSections();
  WrapDefaultContentDivForSubsections();
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
    slideNumber: 'c/t',
    transition: 'convex',
    slideNumber: 'c/t',
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
