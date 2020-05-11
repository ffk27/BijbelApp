"use strict";

const appname = 'Bijbelapp';
const pages = []

// function locationHashChanged() {
//     displayBook(window.location.hash.substr(1));
// }

// window.onhashchange = locationHashChanged;

window.onpopstate = function(event) {
    // if (event.state != null) showPage(pages[event.state.page], false);
    // else window.history.back();
}

function setTitle(title) {
    document.title = appname + ' - ' + title;
}

function loadJSON(url, callback) {
    $.ajax({ url, dataType: 'json' }).done(function (json) {
        callback(json);
    });
}

let bible = null;
let booknr = null;
let translid = 'NBV';

function selectBible(id) {
    translid = id;
    navbarcomp.init();
$('#nav').html(navbarcomp.html);
    loadJSON('res/translations/' + id + '.json', (data) => {
        bible = data;
        if (booknr) showPage(bookcomp);
        else showPage(booklistcomp);
    });
}

function selectBook(nr) {
    booknr = nr
    showPage(bookcomp);
}

function showPage(component, saveHistory=true) {
    component.init();
    setTitle(component.title);
    $('#app').html(component.html);
    // if (saveHistory) history.pushState({page: pages.indexOf(component)}, component.title, '');
}

const navbarcomp = {
    bibleids: ['NBV', 'NBG51', 'NeÜ'],
    html: '',
    init: function() {
        this.html = `
        <nav class="navbar fixed-top navbar-light bg-light">
        <a class="navbar-brand" onclick="showPage(booklistcomp)">BijbelApp</a>
        <!--<form class="form-inline">
            <div class="input-group">
                <input class="form-control py-2" type="search" placeholder="Zoeken" aria-label="Search" id="searchinput">
                <span class="input-group-append">
                <button class="btn btn-outline-secondary" type="button">&#128269;</button>
              </span>
            </div>
        </form>-->
        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              ${translid}
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                ${this.bibleids.map((id) => `<a class="dropdown-item" onclick="selectBible('${id}')">${id}</a>`).join("")}
            </div>
          </li>
        </ul>    
      </nav>    
        `
    }
}
navbarcomp.init();
$('#nav').html(navbarcomp.html);

const booklistcomp = {
    title: 'Boeken',
    html: '',
    bookBtn: function(book) {
        return `<p class="bookBtn"><button type="button" class="btn btn-secondary btn-block" onclick="selectBook(${bible.books.indexOf(book)})">${book.bname}</button></p>`
    },
    init: function() {
        this.html = `
        <div class="row row-cols-2 " id="booklist" align="center">
            <div class="col">
            <h3>OT</h3>
            ${bible.books.slice(0,39).map((book) => this.bookBtn(book)).join("")}
            </div>
            <div class="col">
            <h3>NT</h3>
            ${bible.books.slice(39,66).map((book) => this.bookBtn(book)).join("")}
            </div>
            <div class="col">
            ${bible.books.length > 66 ? '<h3>DT</h3>' : ''}
            ${bible.books.slice(66).map((book) => this.bookBtn(book)).join("")}
            </div>
        </div>
        `
    }
}

const bookcomp = {
    title: 'Boek',
    html: '',
    init: function() {
        window.scrollTo(0,0);
        const book = bible.books[booknr];
        this.title = book.bname;
        this.html = `<h1>${book.bname}</h1>
        <div class="row row-cols-1 row-cols-md-2">`;
        for (const [i, chapter] of book.chapters.entries()) {
            this.html += `<div class="col chapter"><span class="cnumber">${i+1}</span>`;
            for (const vers of chapter) {
                let vnumber = vers[0];
                let text = vers[1];
                let vnumbers = null;
                if (vers[1].match(/\(\d+-\d+\)/)) {
                    text = vers[1].split(/\(\d+-\d+\) /)[1];
                    const verses = vers[1].match(/\(\d+-\d+\)/)[0].match(/\d+/g);
                    vnumbers = [verses[0], verses[1]];
                }
                this.html += `
                <span class="vers">
                    <span class="vnumber">${vnumbers ? (vnumbers[0] + '-' + vnumbers[1]) : vnumber}</span>
                    ${text}
                </span>
                `;
            }
            this.html += '</span></div>';
        }
    }
}

pages.push(booklistcomp, bookcomp);

if (bible) {
    if (booknr) {
        showPage(bookcomp);
    } else {
        showPage(booklistcomp)
    }
} else {
    selectBible(translid);
}