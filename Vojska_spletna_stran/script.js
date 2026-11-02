(function () {
    'use strict';

    var KLJUC = 'kosarica-slovenska-vojska';
    var kosarica = {};

    try {
        kosarica = JSON.parse(localStorage.getItem(KLJUC)) || {};
    } catch (e) {
        kosarica = {};
    }

    var izdelki = Array.prototype.slice.call(document.querySelectorAll('.izdelek'));
    var mreza = document.querySelector('.izdelki');
    var iskanje = document.getElementById('iskanje');
    var razvrsti = document.getElementById('razvrsti');
    var filtri = document.querySelectorAll('.filter');
    var niRezultatov = document.getElementById('niRezultatov');
    var aktivnaKat = 'vse';

    var gumbKosarica = document.getElementById('odpriKosarico');
    var steevec = document.getElementById('stevecKosarice');
    var predal = document.getElementById('predal');
    var zastor = document.getElementById('zastor');
    var seznam = document.getElementById('seznamKosarice');
    var prazna = document.getElementById('praznaKosarica');
    var skupajEl = document.getElementById('skupaj');

    var privzetiRed = izdelki.slice();

    function denar(n) { return '$' + n.toFixed(2); }

    function shrani() {
        try { localStorage.setItem(KLJUC, JSON.stringify(kosarica)); } catch (e) {}
    }

    function podatki(id) {
        var el = document.querySelector('.izdelek[data-id="' + id + '"]');
        return el ? { ime: el.dataset.ime, cena: parseFloat(el.dataset.cena) } : null;
    }

    /* ---------- Košarica ---------- */
    function izrisiKosarico() {
        seznam.innerHTML = '';
        var skupaj = 0, stevilo = 0;

        Object.keys(kosarica).forEach(function (id) {
            var p = podatki(id);
            if (!p) { delete kosarica[id]; return; }
            var kol = kosarica[id];
            skupaj += p.cena * kol;
            stevilo += kol;

            var li = document.createElement('li');
            li.innerHTML =
                '<span class="ime"></span>' +
                '<span class="cena">' + denar(p.cena * kol) + '</span>' +
                '<span class="kolicina">' +
                    '<button type="button" data-akcija="minus" data-id="' + id + '" aria-label="Zmanjšaj količino">−</button>' +
                    '<span>' + kol + '</span>' +
                    '<button type="button" data-akcija="plus" data-id="' + id + '" aria-label="Povečaj količino">+</button>' +
                '</span>' +
                '<button type="button" class="odstrani" data-akcija="odstrani" data-id="' + id + '">Odstrani</button>';
            li.querySelector('.ime').textContent = p.ime;
            seznam.appendChild(li);
        });

        steevec.textContent = stevilo;
        gumbKosarica.classList.toggle('poln', stevilo > 0);
        prazna.hidden = stevilo > 0;
        skupajEl.textContent = denar(skupaj);
        shrani();
    }

    function dodaj(id) {
        kosarica[id] = (kosarica[id] || 0) + 1;
        izrisiKosarico();
    }

    function odpri() {
        predal.classList.add('odprt');
        predal.setAttribute('aria-hidden', 'false');
        zastor.hidden = false;
    }
    function zapri() {
        predal.classList.remove('odprt');
        predal.setAttribute('aria-hidden', 'true');
        zastor.hidden = true;
    }

    document.addEventListener('click', function (e) {
        var gumb = e.target.closest('button');
        if (!gumb) return;

        if (gumb.classList.contains('dodaj') && gumb.closest('.izdelek')) {
            dodaj(gumb.closest('.izdelek').dataset.id);
            var staro = gumb.textContent;
            gumb.textContent = 'Dodano ✓';
            gumb.classList.add('dodano');
            setTimeout(function () {
                gumb.textContent = staro;
                gumb.classList.remove('dodano');
            }, 900);
            return;
        }

        var akcija = gumb.dataset.akcija, id = gumb.dataset.id;
        if (akcija === 'plus') { kosarica[id]++; izrisiKosarico(); }
        if (akcija === 'minus') {
            kosarica[id]--;
            if (kosarica[id] <= 0) delete kosarica[id];
            izrisiKosarico();
        }
        if (akcija === 'odstrani') { delete kosarica[id]; izrisiKosarico(); }
    });

    gumbKosarica.addEventListener('click', odpri);
    document.getElementById('zapriKosarico').addEventListener('click', zapri);
    zastor.addEventListener('click', zapri);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zapri(); });
    document.getElementById('izprazni').addEventListener('click', function () {
        kosarica = {};
        izrisiKosarico();
    });

    /* ---------- Iskanje, filtriranje, razvrščanje ---------- */
    function osvezi() {
        var q = iskanje.value.trim().toLowerCase();
        var vidni = 0;

        izdelki.forEach(function (el) {
            var imeOk = el.dataset.ime.toLowerCase().indexOf(q) !== -1;
            var katOk = aktivnaKat === 'vse' || el.dataset.kat.split(' ').indexOf(aktivnaKat) !== -1;
            el.hidden = !(imeOk && katOk);
            if (!el.hidden) vidni++;
        });
        niRezultatov.hidden = vidni > 0;
    }

    function uredi() {
        var kopija = privzetiRed.slice();
        var nacin = razvrsti.value;
        if (nacin === 'cena-narascajoce') kopija.sort(function (a, b) { return a.dataset.cena - b.dataset.cena; });
        if (nacin === 'cena-padajoce') kopija.sort(function (a, b) { return b.dataset.cena - a.dataset.cena; });
        if (nacin === 'ime') kopija.sort(function (a, b) { return a.dataset.ime.localeCompare(b.dataset.ime); });
        kopija.forEach(function (el) { mreza.appendChild(el); });
    }

    iskanje.addEventListener('input', osvezi);
    razvrsti.addEventListener('change', uredi);
    filtri.forEach(function (f) {
        f.addEventListener('click', function () {
            filtri.forEach(function (x) { x.classList.remove('aktiven'); });
            f.classList.add('aktiven');
            aktivnaKat = f.dataset.kat;
            osvezi();
        });
    });

    /* Prijava na novice: osnovno preverjanje e-pošte */
    var novice = document.querySelector('.novice form');
    if (novice) {
        novice.querySelector('button').addEventListener('click', function () {
            var polje = novice.querySelector('input');
            var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(polje.value);
            polje.style.outline = ok ? '2px solid #3d7a2a' : '2px solid #c94348';
            polje.placeholder = ok ? 'Hvala za prijavo!' : 'Vnesi veljaven e-naslov';
            if (ok) polje.value = '';
        });
    }

    izrisiKosarico();
})();
