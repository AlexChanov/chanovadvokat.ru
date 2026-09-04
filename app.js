/* ============================================================
   Рендер сайта из SITE (data.js) + поведение
   ============================================================ */
(function () {
  'use strict';

  var S = window.SITE || SITE;

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // подсветка незаполненных заглушек {{...}} и масок ___
  function mark(v) {
    return esc(v)
      .replace(/\{\{[^}]*\}\}/g, function (m) { return '<span class="ph">' + m + '</span>'; })
      .replace(/_{2,}/g, function (m) { return '<span class="ph">' + m + '</span>'; });
  }

  function filled(v) { return !!v && !/\{\{|_{2,}/.test(String(v)); }

  function fullName() {
    return [S.lastName, S.firstName, S.midName].filter(Boolean).join(' ');
  }

  function shortName() {
    var ini = function (w) { w = (w || '').trim(); return w ? w[0] + '.' : ''; };
    return [S.lastName, ini(S.firstName), ini(S.midName)].filter(Boolean).join(' ');
  }

  function initials() {
    return ((S.lastName || 'Ч')[0] + (S.firstName || 'М')[0]).toUpperCase();
  }

  function telLink(num, href, cls) {
    return '<a class="' + (cls || '') + '" href="tel:' + esc(String(href).replace(/[^\d+]/g, '')) + '">' + esc(num) + '</a>';
  }

  // ---------- icons ----------
  var ICONS = {
    search:   '<circle cx="15" cy="15" r="10"/><path d="M22.5 22.5 30 30"/>',
    shield:   '<path d="M17 4 5 8v9c0 7 5.4 11 12 13 6.6-2 12-6 12-13V8L17 4Z"/><path d="M12 17.5l3.4 3.4 6.6-7"/>',
    scale:    '<path d="M17 5v22"/><path d="M7 9h20"/><path d="M27 9l4 9a4.5 4.5 0 0 1-8 0l4-9Z"/><path d="M7 9l4 9a4.5 4.5 0 0 1-8 0l4-9Z"/><path d="M10 29h14"/>',
    doc:      '<path d="M8 3h11l7 7v21H8z"/><path d="M19 3v7h7"/><path d="M13 18h9M13 23h9M13 13h4"/>',
    gov:      '<path d="M3 13 17 5l14 8"/><path d="M6 13v13M13 13v13M21 13v13M28 13v13"/><path d="M3 29h28"/>',
    briefcase:'<rect x="3" y="10" width="28" height="19" rx="1"/><path d="M12 10V6h10v4"/><path d="M3 18h28"/>',
    home:     '<path d="M4 15 17 4l13 11"/><path d="M8 13v16h18V13"/><path d="M14 29v-9h6v9"/>'
  };
  function svg(name) {
    return '<svg viewBox="0 0 34 34" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || ICONS.doc) + '</svg>';
  }

  // ---------- brand / header ----------
  $('#brandMark').textContent  = initials();
  $('#brandMark2').textContent = initials();
  $('#brandName').textContent  = shortName();
  $('#brandName2').textContent = shortName();
  $('#brandRole').textContent  = S.role || 'Адвокат';
  $('#ftrName').textContent    = fullName();

  // ---------- hero ----------
  $('#heroEyebrow').innerHTML = '<span>' + esc(S.role || 'Адвокат') +
    (S.geo ? ' · ' + esc(S.geo) : '') + '</span>';
  $('#heroName').textContent = fullName();
  $('#heroSub').textContent  = S.tagline + '. Практика ' + (S.experience || '') + '.';

  var meta = [];
  if (S.experience) meta.push('Юридическая практика ' + S.experience);
  if (S.hours) meta.push(S.hours);
  if (S.geo) meta.push(S.geo);
  $('#heroMeta').innerHTML = meta.map(function (m) {
    return '<span><i></i>' + mark(m) + '</span>';
  }).join('');

  $('#stats').innerHTML = (S.stats || []).map(function (s) {
    return '<div class="stats__i"><div class="stats__v">' + mark(s.value) +
           '</div><div class="stats__l">' + esc(s.label) + '</div></div>';
  }).join('');

  // ---------- phones ----------
  $('#hdrPhone').href = 'tel:' + String(S.phoneHref || '').replace(/[^\d+]/g, '');
  $('#hdrPhone').textContent = S.phone;
  $('#mnavPhone').href = $('#hdrPhone').href;
  $('#mnavPhone').textContent = S.phone;
  $('#barPhone').href = $('#hdrPhone').href;
  $('#barPhone').textContent = 'Позвонить';
  $('#barMail').href = S.whatsapp || ('mailto:' + S.email);
  if (S.whatsapp) { $('#barMail').target = '_blank'; $('#barMail').rel = 'noopener'; $('#barMail').textContent = 'WhatsApp'; }


  // ---------- видеополоса ----------
  (function () {
    var box = $('#bandVideo');
    if (!box) return;
    var el = $('#bandVideoEl');
    var V = S.video || {};
    if (V.poster) el.poster = V.poster;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.remove();                 // остаётся постер фоном полосы
      return;
    }

    var src = (window.innerWidth < 760 ? V.src480 : V.src720) || V.src720;
    var loaded = false;

    function play() {
      var p = el.play();
      if (p && p.catch) p.catch(function () { fallbackPoster(); });
    }

    // автоплей заблокирован (или кадр не декодировался) - кладём постер фоном полосы
    function fallbackPoster() {
      if (V.poster) box.style.background = 'var(--ink-2) url("' + V.poster + '") center 46% / cover';
      el.style.opacity = '0';
    }
    function load() {
      if (loaded || !src) return;
      loaded = true;
      el.src = src;
      el.load();
      play();
    }

    if ('IntersectionObserver' in window) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            if (!loaded) { load(); }
            else if (el.paused) { play(); }
            el.style.opacity = '';
          }
          else if (loaded && !el.paused) { el.pause(); }
        });
      }, { threshold: 0.15 });
      vio.observe(box);
    } else {
      load();
    }

    document.addEventListener('visibilitychange', function () {
      if (!loaded) return;
      if (document.hidden) { el.pause(); } else { play(); }
    });
  })();

  // ---------- practices ----------
  $('#practices-grid').innerHTML = (S.practices || []).map(function (p) {
    var tags = (p.items || []).map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('');
    return '<article class="prac">' +
      '<div class="prac__ico">' + svg(p.icon) + '</div>' +
      '<h3>' + esc(p.title) + '</h3>' +
      '<p>' + esc(p.text) + '</p>' +
      (tags ? '<ul>' + tags + '</ul>' : '') +
      '</article>';
  }).join('');

  // ---------- about ----------
  $('#aboutName').textContent = fullName();
  $('#aboutText').innerHTML = (S.intro || []).map(function (t, i) {
    return '<p' + (i === 0 ? ' class="first"' : '') + '>' + esc(t) + '</p>';
  }).join('');

  var cred = [
    ['Статус', (S.role || 'Адвокат') + (S.chamber ? ', ' + S.chamber : '')],
    ['Адвокатское образование', S.barEntity],
    ['Практика', S.experience],
    ['География', S.geo],
    ['Приём', S.address],
    ['График', S.hours]
  ].filter(function (r) { return filled(r[1]); });
  $('#cred').innerHTML = cred.map(function (r) {
    return '<li><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></li>';
  }).join('');

  // ---------- results ----------
  $('#results-grid').innerHTML = (S.results || []).map(function (r, i) {
    return '<li class="res"><span class="res__n">' + String(i + 1).padStart(2, '0') +
           '</span><span class="res__t">' + esc(r) + '</span></li>';
  }).join('');

  // ---------- priorities banner ----------
  var pr = S.priorities || { items: [] };
  $('#prioQuote').textContent = pr.intro || '';
  $('#princ').innerHTML = (pr.items || []).map(function (p) {
    return '<li><b>' + esc(p.title) + '</b><span>' + esc(p.text) + '</span></li>';
  }).join('');

  // ---------- services ----------
  $('#services-list').innerHTML = (S.services || []).map(function (s, i) {
    return '<div class="srv__row">' +
      '<span class="srv__n">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="srv__name">' + esc(s.name) + '</span>' +
      '</div>';
  }).join('');



  // ---------- faq ----------
  $('#faq-list').innerHTML = (S.faq || []).map(function (f, i) {
    return '<div class="faq__i"><button class="faq__q" type="button" aria-expanded="false" aria-controls="fa' + i + '">' +
      esc(f.q) + '</button><div class="faq__a" id="fa' + i + '"><p>' + esc(f.a) + '</p></div></div>';
  }).join('');

  $$('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentNode, panel = btn.nextElementSibling;
      var open = item.classList.contains('is-open');
      $$('.faq__i').forEach(function (it) {
        it.classList.remove('is-open');
        it.querySelector('.faq__a').style.maxHeight = null;
        it.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---------- contacts ----------
  var ci = [
    ['Телефон',     telLink(S.phone, S.phoneHref)],
    ['Ещё телефон', S.phone2 ? telLink(S.phone2, S.phone2Href) : ''],
    ['WhatsApp',    S.whatsapp ? '<a href="' + esc(S.whatsapp) + '" target="_blank" rel="noopener">Написать в WhatsApp</a>' : ''],
    ['Telegram',    S.telegram ? '<a href="' + esc(S.telegram) + '" target="_blank" rel="noopener">Написать в Telegram</a>' : ''],
    ['E-mail',      S.email ? '<a href="mailto:' + esc(S.email) + '">' + esc(S.email) + '</a>' : ''],
    ['График',      esc(S.hours || '')],
    ['География',   esc(S.geo || '')],
    ['Адрес',       esc(S.address || '')]
  ].filter(function (r) { return r[1]; });
  $('#cinfo').innerHTML = ci.map(function (r) {
    return '<li><b>' + esc(r[0]) + '</b><span>' + r[1] + '</span></li>';
  }).join('');

  // ---------- reach (прямые способы связи вместо формы) ----------
  var ICO = {
    wa:   '<path d="M20 3.4A16.4 16.4 0 0 0 5.6 28.1L4 36.6l8.7-1.6A16.4 16.4 0 1 0 20 3.4Z"/><path d="M14 12.4c.4-.9.8-.9 1.3-.9h1c.3 0 .8 0 1.2 1l1.4 3.3c.2.4.1.8-.1 1.1l-.7.9c-.3.3-.5.6-.2 1.1a11 11 0 0 0 5 4.4c.5.2.9.2 1.2-.2l1-1.2c.3-.4.7-.4 1.1-.2l3.2 1.6c.5.2.8.4.9.6.1.5 0 1.7-.5 2.6-.6 1-2.1 1.9-3.3 2-1 .1-2.2.2-5.4-1.1a19.4 19.4 0 0 1-8-7.5c-.6-1-1.4-2.7-1.4-4.4 0-1.7.9-2.6 1.3-3.1Z"/>',
    tel:  '<path d="M8.4 5h6.1l3 7.4-3.7 2.1a19 19 0 0 0 9.7 9.7l2.1-3.7 7.4 3v6.1c0 1.3-1.1 2.4-2.4 2.4A28.5 28.5 0 0 1 6 7.4C6 6.1 7.1 5 8.4 5Z"/>',
    mail: '<rect x="3" y="7" width="34" height="26" rx="2"/><path d="m3.8 8.6 16.2 12 16.2-12"/>',
    tg:   '<path d="M35 6 3.6 18.2c-1.4.5-1.4 2.5 0 3l7.8 2.6 3 9.2c.4 1.2 1.9 1.5 2.7.6l4.2-4.5 8.1 6c1 .7 2.4.2 2.7-1L37 8c.3-1.4-1-2.5-2-2Z"/><path d="m11.4 23.8 18.4-12-14 15.4"/>'
  };
  function ricon(k) {
    return '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICO[k] || ICO.tel) + '</svg>';
  }
  function telHrefOf(v) { return 'tel:' + String(v || '').replace(/[^0-9+]/g, ''); }

  var reach = [];
  if (S.whatsapp) {
    reach.push({ k: 'wa', href: S.whatsapp, ext: true, hot: true,
                 t: 'Написать в WhatsApp', s: S.phone });
  }
  if (S.telegram) {
    reach.push({ k: 'tg', href: S.telegram, ext: true, t: 'Написать в Telegram', s: 'Ответ в мессенджере' });
  }
  reach.push({ k: 'tel', href: telHrefOf(S.phoneHref), t: S.phone, s: 'Мобильный - звонок в любое время' });
  if (S.phone2) {
    reach.push({ k: 'tel', href: telHrefOf(S.phone2Href), t: S.phone2, s: 'Городской' });
  }
  reach.push({ k: 'mail', href: 'mailto:' + S.email, t: S.email, s: 'Почта - для документов' });

  $('#reach').innerHTML = reach.map(function (r) {
    return '<a class="reach__i' + (r.hot ? ' reach__i--hot' : '') + '" href="' + esc(r.href) + '"' +
      (r.ext ? ' target="_blank" rel="noopener"' : '') + '>' +
      '<span class="reach__ico">' + ricon(r.k) + '</span>' +
      '<span class="reach__txt"><b>' + esc(r.t) + '</b><span>' + esc(r.s) + '</span></span>' +
      '<span class="reach__go" aria-hidden="true"></span></a>';
  }).join('');

  $('#year').textContent = new Date().getFullYear();
  var fr = $('#ftrReg');
  if (fr) fr.textContent = S.hours || '';

  // ---------- header state ----------
  var hdr = $('#hdr');
  var onScroll = function () { hdr.classList.toggle('is-stuck', window.scrollY > 40); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- mobile menu ----------
  var mnav = $('#mnav');
  var toggle = function (on) {
    mnav.classList.toggle('is-on', on);
    document.body.style.overflow = on ? 'hidden' : '';
  };
  $('#burger').addEventListener('click', function () { toggle(true); });
  $('#mnavX').addEventListener('click', function () { toggle(false); });
  $$('#mnav a').forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });

  // ---------- reveal ----------
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else {
    $$('.rv').forEach(function (el) { el.classList.add('is-in'); });
  }
})();
