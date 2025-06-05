// ==UserScript==
// @name         Gemini Hotkeys (New Chat & Toggle Menu)
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds hotkeys to start a new chat and toggle the menu in Gemini.
// @author       m.naoya.q5@gmial.com
// @match        https://gemini.google.com/*
// @grant        none
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/beive60/gemini_hotkeys/main/gemini_hotkeys.meta.js
// @downloadURL  https://raw.githubusercontent.com/beive60/gemini_hotkeys/main/gemini_hotkeys.user.js
// @supportURL   https://github.com/beive60/gemini_hotkeys/issues
// ==/UserScript==

(function() {
    'use strict';

    // --- 設定: 新しいチャット ---
    const NEW_CHAT_HOTKEY_CTRL = true;
    const NEW_CHAT_HOTKEY_ALT = false;
    const NEW_CHAT_HOTKEY_SHIFT = false;
    const NEW_CHAT_HOTKEY_KEY = 'I'; // 例: Ctrl + I
    // --- 設定ここまで ---

    // --- 設定: メニュー開閉トグル ---
    const MENU_TOGGLE_HOTKEY_CTRL = true;
    const MENU_TOGGLE_HOTKEY_ALT = false;
    const MENU_TOGGLE_HOTKEY_SHIFT = false;
    const MENU_TOGGLE_HOTKEY_KEY = 'M'; // 例: Ctrl + M
    // --- 設定ここまで ---

    // 新しいチャットボタンのセレクタ候補
    const newChatButtonSelectors = [
        '.fab.mat-mdc-fab.mat-primary.mat-mdc-button-base.gmat-mdc-button.gmat-fab-extended',
        'button[aria-label="New chat"]',
        'button[aria-label="新しいチャット"]',
        'div[role="button"][aria-label="New chat"]',
        'div[role="button"][aria-label="新しいチャット"]',
        '.nav-item-container a[href="/app"] .new-chat-text',
        '.nav-item-container button:has(.new-chat-text)',
        '.new-chat-button',
    ];

    // メニュー開閉ボタンのセレクタ候補
    const menuButtonSelectors = [
        'button[aria-label="Main menu"]',
        'button[aria-label="メインメニュー"]',
        'button[aria-label="Toggle navigation menu"]',
        'button[aria-label="ナビゲーション メニューを切り替える"]',
        '.menu-button',
        'mat-toolbar-row div.model-switcher-button button.mat-icon-button',
        'div.header-buttons > button:first-child',
        'button[aria-label*="menu" i]',
    ];

    function findElement(selectors) {
        for (const selector of selectors) {
            try {
                const element = document.querySelector(selector);
                if (element && element.offsetParent !== null) {
                    return element;
                }
            } catch (e) {
                // console.warn(`Selector error for "${selector}":`, e);
            }
        }
        return null;
    }

    function findNewChatButton() {
        let button = findElement(newChatButtonSelectors);
        if (button) return button;

        const allElements = document.querySelectorAll('button, div[role="button"], a[role="button"]');
        for (const el of allElements) {
            const textContent = (el.textContent || el.innerText || '').trim();
            const ariaLabel = el.getAttribute('aria-label');
            if ((textContent.includes('新しいチャット') || textContent.toLowerCase().includes('new chat') ||
                 (ariaLabel && (ariaLabel.includes('新しいチャット') || ariaLabel.toLowerCase().includes('new chat')))) &&
                el.offsetParent !== null) {
                console.log('Found potential new chat button by text:', el);
                return el;
            }
        }
        return null;
    }

    function findMenuButton() {
        let button = findElement(menuButtonSelectors);
        if (button) return button;

        const allButtons = document.querySelectorAll('button, div[role="button"]');
        for (const el of allButtons) {
            if (el.querySelector('svg path[d*="M3"], .material-icons.menu')) {
                 if (el.offsetParent !== null) {
                    console.log('Found potential menu button by icon:', el);
                    return el;
                 }
            }
            const ariaLabel = el.getAttribute('aria-label');
            if (ariaLabel && (ariaLabel.toLowerCase().includes('menu') || ariaLabel.toLowerCase().includes('navigation')) && el.offsetParent !== null) {
                 console.log('Found potential menu button by aria-label (generic menu):', el);
                 return el;
            }
        }
        return null;
    }

    function triggerNewChat() {
        const newChatButton = findNewChatButton();
        if (newChatButton) {
            console.log('New chat button found:', newChatButton);
            newChatButton.click();
            console.log('New chat button clicked.');
        } else {
            console.warn('Gemini Hotkey: Could not find the new chat button. The website structure might have changed.');
            alert('新しいチャットボタンが見つかりませんでした。Userscriptのセレクタを更新する必要があるかもしれません。');
        }
    }

    function toggleMenu() {
        const menuButton = findMenuButton();
        if (menuButton) {
            console.log('Menu button found:', menuButton);
            menuButton.click();
            console.log('Menu button clicked (toggled).');
        } else {
            console.warn('Gemini Hotkey: Could not find the menu toggle button. The website structure might have changed.');
            alert('メニューボタンが見つかりませんでした。Userscriptのセレクタを更新する必要があるかもしれません。');
        }
    }

    document.addEventListener('keydown', function(e) {
        const activeElement = document.activeElement;
        if (activeElement) {
            const tagName = activeElement.tagName.toLowerCase();
            const isContentEditable = activeElement.isContentEditable;
            if (tagName === 'input' || tagName === 'textarea' || isContentEditable) {
                return;
            }
        }

        let hotkeyActivated = false;

        if (e.key.toUpperCase() === NEW_CHAT_HOTKEY_KEY.toUpperCase() &&
            e.ctrlKey === NEW_CHAT_HOTKEY_CTRL &&
            e.altKey === NEW_CHAT_HOTKEY_ALT &&
            e.shiftKey === NEW_CHAT_HOTKEY_SHIFT) {
            console.log('Gemini Hotkey: New Chat hotkey activated!');
            triggerNewChat();
            hotkeyActivated = true;
        }
        else if (e.key.toUpperCase() === MENU_TOGGLE_HOTKEY_KEY.toUpperCase() &&
            e.ctrlKey === MENU_TOGGLE_HOTKEY_CTRL &&
            e.altKey === MENU_TOGGLE_HOTKEY_ALT &&
            e.shiftKey === MENU_TOGGLE_HOTKEY_SHIFT) {
            console.log('Gemini Hotkey: Menu Toggle hotkey activated!');
            toggleMenu();
            hotkeyActivated = true;
        }

        if (hotkeyActivated) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    console.log('Gemini Hotkeys script loaded (New Chat & Toggle Menu). Version 0.5'); // バージョン情報をログに出力
})();