// ==UserScript==
// @name         Hide button for Habr.com
// @namespace    https://github.com/svischuk
// @version      0.1
// @description  Help to hide posts
// @author       You
// @match        https://habr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=habr.com
// @grant           property:settings
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           GM_getResourceText
// @grant           GM_getResourceURL
// @grant           GM_addStyle
// @grant           GM_log
// @grant           GM_setClipboard
// @grant           GM_xmlhttpRequest
// @grant           unsafeWindow
// @grant           GM_info
// @grant           GM_openInTab
// @grant           GM_registerMenuCommand
// ==/UserScript==

const timeout = 10;
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
        const articleHubs = articleSnippet.getElementsByClassName('tm-article-snippet__hubs').item(0)
        const articleLabels = articleSnippet.getElementsByClassName('tm-article-snippet__labels').item(0)
        const articleBody = articleSnippet.getElementsByClassName('tm-article-body').item(0)
        const dataIcons = article.getElementsByClassName('tm-data-icons').item(0)
        const id = article.id
        const articleBodyStyle = articleBody.style
        const toToggleList = []
        toToggleList.push(articleBodyStyle)
        if (articleLabels) {
            toToggleList.push(articleLabels.style)
        }
        if (articleHubs) {
            toToggleList.push(articleHubs.style)
        }
        const button = document.createElement('div')
        button.classList.add('bookmarks-button__counter', 'bookmarks-button', 'tm-data-icons__item')
        dataIcons.lastChild.before(button)

        const labelsMarginBottom = articleLabels ? parseInt(window.getComputedStyle(articleLabels, null).getPropertyValue('margin-bottom'), 10) + articleLabels.offsetHeight : 0
        const hubsHeight = articleHubs ? articleHubs.offsetHeight : 0
        const articleSnippetMarginBottom = parseInt(window.getComputedStyle(articleSnippet, null).getPropertyValue('margin-bottom'), 10)
        const totalBodyMarginBottom = parseInt(window.getComputedStyle(articleBody, null).getPropertyValue('margin-bottom'), 10)
        const hiddenBodyMarginBottom = totalBodyMarginBottom - articleSnippetMarginBottom + labelsMarginBottom + hubsHeight

        const heihtWithPadding = Math.ceil(parseFloat(window.getComputedStyle(articleBody, null).getPropertyValue('height')));
        let height = heihtWithPadding - Math.ceil(parseFloat(window.getComputedStyle(articleBody, null).getPropertyValue('padding-top')));
        articleBodyStyle.height = height + 'px'

        const articleImages = articleBody.getElementsByTagName('img')
        Array.prototype.forEach.call(articleImages, function (articleImage) {
            if (!articleImage.offsetHeight) {
                articleImage.addEventListener('load', function () {
                    const articleBodyWidth = Math.ceil(parseFloat(window.getComputedStyle(articleBody, null).getPropertyValue('width')));
                    const imageNaturalWidth = articleImage.naturalWidth
                    const imageNaturalHeight = articleImage.naturalHeight
                    const newImgHeight = Math.ceil(articleBodyWidth / imageNaturalWidth * imageNaturalHeight)
                    height = (height + (imageNaturalWidth > articleBodyWidth ? newImgHeight : imageNaturalHeight))
                    articleBodyStyle.height = height + 'px'
                })
            }
        })
        hideOrShow()
        window.addEventListener('focus',hideOrShow)
        function hideOrShow(){
            if (localStorage.getItem(id)) {
                hide()
            } else {
                show()
            }
        }

        function showOnclick() {
            show()
            window.scrollBy(0, parseInt(localStorage.getItem(id), 10))
            localStorage.removeItem(id)
        }

        function hideOnclick() {
            const scroll = height + hiddenBodyMarginBottom
            window.scrollBy(0, -scroll)
            hide()
            localStorage.setItem(id, scroll)
        }

        function show() {
            toggle(hideOnclick, messages.hide[lang], 'block', '100%')
        }

        function hide() {
            toggle(showOnclick, messages.show[lang], 'none', '40%')
        }

        function toggle(onclick, innerHTML, display, opacity) {
            articleSnippet.style.opacity = opacity
            dataIcons.style.opacity = opacity
            toToggleList.forEach((value) => {
                value.display = display
            })
            button.innerHTML = innerHTML
            button.onclick = onclick
        }
    })
}
