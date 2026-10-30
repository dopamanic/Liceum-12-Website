// Поведінка сторінки: тема, шапка, навігація, меню, модалки, форма, кабінет.
// Жодних залежностей, усе всередині однієї області видимості.

(function () {
  'use strict';

  var root = document.documentElement;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Theme ---------- */
  function applyTheme(mode) {
    root.classList.toggle('dark', mode === 'dark');
    try { localStorage.setItem('stemlab_theme', mode); } catch (e) {}
    $('.i-sun').classList.toggle('hidden', mode === 'dark');
    $('.i-moon').classList.toggle('hidden', mode !== 'dark');
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#070F0E' : '#0A1413');
  }
  applyTheme(root.classList.contains('dark') ? 'dark' : 'light');
  $('#theme-btn').addEventListener('click', function () {
    applyTheme(root.classList.contains('dark') ? 'light' : 'dark');
  });

  /* ---------- Header: transparent over hero, solid after ---------- */
  var hdr = $('#hdr');
  function onScroll() {
    hdr.classList.toggle('solid', window.scrollY > 8);
    syncActiveNav();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Nav dropdown ---------- */
  $$('[data-menu]').forEach(function (wrap) {
    var btn = wrap.querySelector('button');

    function openMenu()  { wrap.classList.add('open');    btn.setAttribute('aria-expanded', 'true'); }
    function closeMenu() { wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (wrap.classList.contains('open')) closeMenu(); else openMenu();
    });
    // on document, so Esc works wherever focus happens to sit
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('open')) { closeMenu(); btn.focus(); }
    });
    wrap.addEventListener('focusout', function (e) {
      if (!wrap.contains(e.relatedTarget)) closeMenu();
    });
    $$('a', wrap).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) closeMenu();
    });
  });

  /* ---------- Active nav section ---------- */
  var navLinks = $$('#nav a.h-link');
  var sections = navLinks
    .map(function (l) { return document.getElementById(l.getAttribute('href').slice(1)); })
    .filter(Boolean);

  // Deterministic: the active section is the last one whose top has passed
  // just below the header. An observer band would miss fast or jumped scrolls.
  function syncActiveNav() {
    if (!sections || !sections.length) return;
    var line = window.scrollY + 170;
    var current = null;
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top + window.scrollY <= line) current = s;
    });
    navLinks.forEach(function (l) {
      var on = !!current && l.getAttribute('href') === '#' + current.id;
      l.setAttribute('data-active', on ? 'true' : 'false');
    });
  }
  onScroll();

  /* ---------- Mobile drawer ---------- */
  var mob = $('#mob');
  var mobBg = $('.mob-bg', mob);
  var mobPanel = $('.mob-panel', mob);
  var mobBtn = $('#mob-btn');

  function openDrawer() {
    mob.setAttribute('aria-hidden', 'false');
    mobBtn.setAttribute('aria-expanded', 'true');
    mob.classList.remove('pointer-events-none');
    mobBg.classList.add('opacity-100');
    mobPanel.classList.remove('translate-x-full');
    lockScroll(true);
  }
  function closeDrawer() {
    mob.setAttribute('aria-hidden', 'true');
    mobBtn.setAttribute('aria-expanded', 'false');
    mobBg.classList.remove('opacity-100');
    mobPanel.classList.add('translate-x-full');
    if (!$('.modal.open')) lockScroll(false);
    window.setTimeout(function () { mob.classList.add('pointer-events-none'); }, 260);
  }
  mobBtn.addEventListener('click', openDrawer);
  $('#mob-close').addEventListener('click', closeDrawer);
  mobBg.addEventListener('click', closeDrawer);
  $$('.mob-lnk', mob).forEach(function (l) { l.addEventListener('click', closeDrawer); });

  /* ---------- Scroll lock ---------- */
  function lockScroll(on) {
    document.body.style.overflow = on ? 'hidden' : '';
  }

  /* ---------- Modals ---------- */
  var lastFocus = null;

  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    lastFocus = document.activeElement;
    closeDrawer();
    m.classList.add('open');
    lockScroll(true);
    var first = m.querySelector('input, select, button');
    if (first) window.setTimeout(function () { first.focus(); }, 60);
  }
  function closeModal(m) {
    m.classList.remove('open');
    if (!$('.modal.open')) lockScroll(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $$('.reg-trig').forEach(function (b) {
    b.addEventListener('click', function () {
      var course = b.getAttribute('data-course');
      if (course) {
        var sel = $('#f-course');
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].text === course) { sel.selectedIndex = i; break; }
        }
      }
      openModal('reg-modal');
    });
  });

  $$('.cab-trig').forEach(function (b) {
    b.addEventListener('click', function () { renderCabinet(); openModal('cab-modal'); });
  });

  $$('.modal-x').forEach(function (b) {
    b.addEventListener('click', function () { closeModal(b.closest('.modal')); });
  });
  $$('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m) closeModal(m); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = $('.modal.open');
    if (open) { closeModal(open); return; }
    if (mob.getAttribute('aria-hidden') === 'false') closeDrawer();
  });

  /* Focus trap inside an open modal */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var m = $('.modal.open');
    if (!m) return;
    var items = $$('a[href], button, input, select, textarea', m).filter(function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- Storage ---------- */
  var KEY = 'stemlab_applications';
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  /* ---------- Registration form ---------- */
  var form = $('#reg-form');
  var errBox = $('#f-error');
  var okBox = $('#f-ok');

  function fail(msg, field) {
    errBox.textContent = msg;
    errBox.classList.remove('hidden');
    if (field) field.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errBox.classList.add('hidden');
    okBox.classList.add('hidden');

    var nameEl = $('#f-name'), gradeEl = $('#f-grade'), courseEl = $('#f-course');
    var phoneEl = $('#f-phone'), emailEl = $('#f-email');

    var name = nameEl.value.trim();
    var grade = gradeEl.value;
    var course = courseEl.value;
    var phone = phoneEl.value.trim();
    var email = emailEl.value.trim();

    if (name.length < 4 || name.indexOf(' ') === -1) {
      return fail('Вкажіть прізвище та імʼя учня повністю.', nameEl);
    }
    if (!grade)  return fail('Оберіть клас.', gradeEl);
    if (!course) return fail('Оберіть напрямок.', courseEl);
    if (phone.replace(/\D/g, '').length < 9) {
      return fail('Вкажіть телефон у форматі +38 0XX XXX XX XX.', phoneEl);
    }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
      return fail('Перевірте електронну пошту.', emailEl);
    }

    var list = load();
    var dup = list.some(function (r) {
      return r.name.toLowerCase() === name.toLowerCase() && r.course === course;
    });
    if (dup) return fail(name + ' уже записаний на «' + course + '».', nameEl);

    list.push({
      id: Date.now(),
      name: name, grade: grade, course: course,
      phone: phone, email: email,
      created: new Date().toISOString()
    });
    save(list);

    form.reset();
    okBox.textContent = 'Заявку збережено. Ми зателефонуємо впродовж робочого дня.';
    okBox.classList.remove('hidden');
    window.setTimeout(function () {
      var m = $('#reg-modal');
      if (m.classList.contains('open')) closeModal(m);
      okBox.classList.add('hidden');
    }, 2400);
  });

  /* ---------- Cabinet ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderCabinet() {
    var list = load();
    var box = $('#cab-list');
    var empty = $('#cab-empty');

    if (!list.length) {
      box.innerHTML = '';
      box.classList.add('hidden');
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    box.classList.remove('hidden');

    box.innerHTML = list.map(function (r) {
      return '' +
        '<div class="flex items-start justify-between gap-4 py-4">' +
          '<div class="min-w-0">' +
            '<p class="font-display font-bold text-[15.5px] tracking-[-.015em]">' + esc(r.name) + '</p>' +
            '<p class="text-[14px] text-brand dark:text-brand-300 font-medium mt-0.5">' + esc(r.course) + '</p>' +
            '<p class="text-[13.5px] text-fg-muted dark:text-fgd-muted mt-1 nums">' +
              esc(r.grade) + ' · заявка від ' +
              new Date(r.created).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }) +
            '</p>' +
          '</div>' +
          '<button type="button" data-del="' + r.id + '" class="w-10 h-10 -mr-2 grid place-items-center rounded-full text-fg-muted dark:text-fgd-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-paper dark:hover:bg-night-800 transition-colors shrink-0" aria-label="Скасувати заявку">' +
            '<svg class="w-[17px] h-[17px]" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 12.2A2 2 0 008.5 21h7a2 2 0 002-1.8L18.5 7M9 7V4.5A1.5 1.5 0 0110.5 3h3A1.5 1.5 0 0115 4.5V7"/></svg>' +
          '</button>' +
        '</div>';
    }).join('');

    $$('[data-del]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = Number(b.getAttribute('data-del'));
        save(load().filter(function (r) { return r.id !== id; }));
        renderCabinet();
      });
    });
  }
})();
