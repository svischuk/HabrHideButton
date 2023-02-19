// ==UserScript==
// @name         Hide button for Habr.com
// @namespace    https://github.com/svischuk
// @version      0.14
// @description  Help to hide posts
// @author       svischuk
// @match        https://habr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=habr.com
// @downloadURL  https://github.com/svischuk/HabrHideButton/raw/main/HabrHideButton.user.js
// @updateURL    https://github.com/svischuk/HabrHideButton/raw/main/HabrHideButton.meta.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

const timeout = 0;
const messages = {
    hide: {
        'ru': 'Скрыть',
        'en': 'Hide'
    },
    show: {
        'ru': 'Показать',
        'en': 'Show'
    }
}
const classesToBlockNames = [
    'tm-article-snippet__meta-container',
    'tm-article-snippet__stats',
    'tm-article-snippet__hubs-container',
    'tm-article-snippet__labels-container',
    'tm-article-body',
]
window.addEventListener('popstate', function () {
    setTimeout(script, timeout)
})
const origOpen = XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function (e, url) {
    if (url.startsWith('https://habr.com/kek/v2/articles/')) {
        this.addEventListener('load', () => {
            setTimeout(script, timeout)
        })
    }
    origOpen.apply(this, arguments)
}

function script() {
    const htmlElement = document.getElementsByTagName('html').item(0);
    const lang = htmlElement.getAttribute('lang');
    const articles = htmlElement.getElementsByClassName('tm-articles-list__item')
    Array.prototype.forEach.call(articles, function (article) {
        const articleSnippet = article.getElementsByClassName('tm-article-snippet').item(0)

        const articleID = article.id
        const elementsToToggleList = []
        Array.prototype.forEach.call(classesToBlockNames, function (classToBlockName) {
            const classToBlock = article.getElementsByClassName(classToBlockName).item(0)
            if (classToBlock) {
                elementsToToggleList.push(classToBlock.style)
            }
        })

        const button = document.createElement('div')
        button.classList.add('bookmarks-button__counter', 'bookmarks-button', 'tm-data-icons__item')
        const dataIcons = article.getElementsByClassName('tm-data-icons').item(0)
        dataIcons.lastChild.before(button)

        hideOrShow()
        window.addEventListener('focus', hideOrShow)

        function hideOrShow() {
            if (localStorage.getItem(articleID)) {
                hide()
            } else {
                show()
            }
        }

        function getArticleHeight() {
            return parseFloat(window.getComputedStyle(article, null).getPropertyValue('height'));
        }

        function showOnclick() {
            let scroll = getArticleHeight()
            show()
            scroll -= getArticleHeight()
            window.scrollBy(0, -scroll)
            localStorage.removeItem(articleID)
        }

        function hideOnclick() {
            let scroll = getArticleHeight()
            hide()
            scroll -= getArticleHeight()
            window.scrollBy(0, -scroll)
            localStorage.setItem(articleID, scroll)
        }

        function show() {
            toggle(hideOnclick, messages.hide[lang], '', '100%')
        }

        function hide() {
            toggle(showOnclick, messages.show[lang], 'none', '40%')
        }

        function toggle(onclick, innerHTML, display, opacity) {
            articleSnippet.style.opacity = opacity
            dataIcons.style.opacity = opacity
            elementsToToggleList.forEach((value) => {
                value.display = display
            })
            button.innerHTML = innerHTML
            button.onclick = onclick
        }
    })
}
