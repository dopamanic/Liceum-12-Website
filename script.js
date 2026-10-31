/* Поведінка сторінки: тема, шапка, меню, модалки, форма запису, кабінет.
   Без залежностей. Усе в одній області видимості, щоб нічого не потрапляло
   в глобальний простір. */

(function () {
  'use strict';

  const $  = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Тема
  // Клас `dark` ставить інлайновий скрипт у <head> ще до рендеру,
  // щоб сторінка не блимнула світлою. Тут лишається перемикання.

  const root = document.documentElement;
  const sun = $('.icon-sun');
  const moon = $('.icon-moon');
  const themeColor = $('meta[name="theme-color"]');

  function setTheme(dark) {
    root.classList.toggle('dark', dark);
    sun.hidden = dark;
    moon.hidden = !dark;
    themeColor.content = dark ? '#070F0E' : '#0A1413';
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch (e) {
      /* приватний режим: тема просто не переживе перезавантаження */
    }
  }

  setTheme(root.classList.contains('dark'));
  $('#theme-btn').addEventListener('click', () => setTheme(!root.classList.contains('dark')));

  // Шапка й активний розділ
  // Позиції розділів міряємо один раз. Читати їх на кожну подію скролу
  // означало б змушувати браузер перераховувати розкладку десятки разів
  // на секунду, а змінюються вони лише разом із самою розкладкою.

  const header = $('#header');
  const navLinks = $$('#nav a.nav__link');
  let marks = [];

  function measure() {
    marks = navLinks
      .map(link => {
        const section = $(link.getAttribute('href'));
        return section && { link, top: section.getBoundingClientRect().top + scrollY };
      })
      .filter(Boolean);
  }

  function update() {
    header.classList.toggle('is-stuck', scrollY > 8);

    // активний — останній розділ, верх якого вже пройшов під шапкою
    const current = marks.filter(mark => mark.top <= scrollY + 170).pop();
    marks.forEach(({ link }) => {
      link.setAttribute('aria-current', String(link === current?.link));
    });
  }

  // Події скролу приходять частіше за кадри, тож працюємо раз на кадр.
  let frame = 0;
  function onScroll() {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; update(); });
  }

  measure();
  update();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { measure(); update(); });
  addEventListener('load', () => { measure(); update(); });   // фото зсувають секції

  // Випадайка «Напрямки»
  // Відкриття по наведенню зроблене в CSS. Якби воно жило тут, наведення
  // й клік перемикали б стан один одного.

  function closeMenu(menu) {
    menu.classList.remove('is-open');
    $('.menu__button', menu).setAttribute('aria-expanded', 'false');
  }

  $$('[data-menu]').forEach(menu => {
    const button = $('.menu__button', menu);

    button.addEventListener('click', event => {
      event.stopPropagation();   // інакше слухач нижче одразу ж закриє меню
      button.setAttribute('aria-expanded', String(menu.classList.toggle('is-open')));
    });

    menu.addEventListener('focusout', event => {
      if (!menu.contains(event.relatedTarget)) closeMenu(menu);
    });

    $$('a', menu).forEach(link => link.addEventListener('click', () => closeMenu(menu)));
  });

  // Один слухач на документ, а не по одному на кожне меню.
  addEventListener('click', event => {
    $$('.menu.is-open').forEach(menu => {
      if (!menu.contains(event.target)) closeMenu(menu);
    });
  });

  // Бічне меню та модалки
  // Прокрутку блокує одне правило: заблокована, поки відкрите хоч що-небудь.
  // Інакше закриття одного шару знімало б блок, потрібний іншому.

  const drawer = $('#drawer');
  const menuButton = $('#menu-btn');
  let lastFocused = null;

  function lockScroll() {
    const open = drawer.dataset.open === 'true' || Boolean($('.modal.is-open'));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function setDrawer(open) {
    drawer.dataset.open = String(open);
    menuButton.setAttribute('aria-expanded', String(open));
    drawer.inert = !open;      // прибирає вміст із Tab і з читача екрана
    lockScroll();
  }

  function openModal(id) {
    const modal = $('#' + id);
    lastFocused = document.activeElement;
    setDrawer(false);
    modal.classList.add('is-open');
    lockScroll();
    // фокус на перше поле; у кабінеті полів немає, тож на першу кнопку
    setTimeout(() => ($('.field', modal) ?? $('button', modal)).focus(), 60);
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    lockScroll();
    lastFocused?.focus();
  }

  menuButton.addEventListener('click', () => setDrawer(true));
  $$('[data-close-drawer]').forEach(el => el.addEventListener('click', () => setDrawer(false)));
  $$('.drawer__link').forEach(link => link.addEventListener('click', () => setDrawer(false)));
  setDrawer(false);            // початковий стан: закрите й inert

  $$('[data-open-form]').forEach(button => {
    button.addEventListener('click', () => {
      // у <option> немає атрибута value, тому значення дорівнює тексту
      if (button.dataset.course) $('#f-course').value = button.dataset.course;
      openModal('enrol-modal');
    });
  });

  $$('[data-open-cabinet]').forEach(button => {
    button.addEventListener('click', () => { renderCabinet(); openModal('cabinet-modal'); });
  });

  $$('[data-close-modal]').forEach(button => {
    button.addEventListener('click', () => closeModal(button.closest('.modal')));
  });

  $$('.modal').forEach(modal => {
    // клік саме по підкладці, а не по вмісту картки
    modal.addEventListener('click', event => {
      if (event.target === modal) closeModal(modal);
    });
  });

  // Клавіатура
  // Esc закриває верхній шар; Tab не випускає фокус із відкритої модалки.

  addEventListener('keydown', event => {
    const modal = $('.modal.is-open');

    if (event.key === 'Escape') {
      const menu = $('.menu.is-open');
      if (menu) closeMenu(menu);
      else if (modal) closeModal(modal);
      else if (drawer.dataset.open === 'true') setDrawer(false);
      return;
    }

    if (event.key !== 'Tab' || !modal) return;

    const items = $$('a[href], button, input, select', modal)
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];
    const edge = event.shiftKey ? first : last;
    if (document.activeElement !== edge) return;

    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  });

  // Заявки
  // Зберігаються лише в браузері відвідувача. Коли зʼявиться сервер,
  // переписати доведеться тільки ці дві функції.

  const STORE = 'applications';

  function readApplications() {
    try {
      return JSON.parse(localStorage.getItem(STORE)) ?? [];
    } catch (e) {
      return [];               // сховище заблоковане або в ньому сміття
    }
  }

  function writeApplications(list) {
    try {
      localStorage.setItem(STORE, JSON.stringify(list));
    } catch (e) {
      /* переповнене або заблоковане сховище — мовчки пропускаємо */
    }
  }

  // Форма запису

  const form = $('#enrol-form');
  const errorBox = $('#form-error');
  const okBox = $('#form-ok');

  function showError(message, field) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    field.focus();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    errorBox.hidden = true;
    okBox.hidden = true;

    const nameField = $('#f-name');
    const gradeField = $('#f-grade');
    const courseField = $('#f-course');
    const phoneField = $('#f-phone');
    const emailField = $('#f-email');

    const name = nameField.value.trim();
    const phone = phoneField.value.trim();
    const email = emailField.value.trim();
    const grade = gradeField.value;
    const course = courseField.value;

    // перша невдала перевірка зупиняє відправку й веде фокус до поля
    if (name.length < 4 || !name.includes(' ')) {
      return showError('Вкажіть прізвище та імʼя учня повністю.', nameField);
    }
    if (!grade)  return showError('Оберіть клас.', gradeField);
    if (!course) return showError('Оберіть напрямок.', courseField);
    if (phone.replace(/\D/g, '').length < 9) {
      return showError('Вкажіть телефон у форматі +38 0XX XXX XX XX.', phoneField);
    }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
      return showError('Перевірте електронну пошту.', emailField);
    }

    const list = readApplications();
    const already = list.some(item =>
      item.name.toLowerCase() === name.toLowerCase() && item.course === course);
    if (already) return showError(`${name} уже записаний на «${course}».`, nameField);

    list.push({ id: Date.now(), name, grade, course, phone, email, created: new Date().toISOString() });
    writeApplications(list);

    form.reset();
    okBox.textContent = 'Заявку збережено. Ми зателефонуємо впродовж робочого дня.';
    okBox.hidden = false;

    setTimeout(() => {
      closeModal($('#enrol-modal'));
      okBox.hidden = true;
    }, 2400);
  });

  // Кабінет заявок
  // Розмітку рядка тримає <template> у index.html. Текст підставляється
  // через textContent, тож екранування не потрібне взагалі.

  const cabinet = $('#cabinet-list');
  const cabinetEmpty = $('#cabinet-empty');
  const rowTemplate = $('#cabinet-row');
  const formatDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

  function renderCabinet() {
    const list = readApplications();

    cabinet.replaceChildren();
    cabinet.hidden = list.length === 0;
    cabinetEmpty.hidden = list.length > 0;

    list.forEach(item => {
      const row = rowTemplate.content.firstElementChild.cloneNode(true);
      $('[data-name]', row).textContent = item.name;
      $('[data-course]', row).textContent = item.course;
      $('[data-when]', row).textContent =
        `${item.grade} · заявка від ${formatDate.format(new Date(item.created))}`;
      $('[data-remove]', row).dataset.remove = item.id;
      cabinet.append(row);
    });
  }

  // Делегування: один слухач переживає всі перемальовування списку.
  cabinet.addEventListener('click', event => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;

    const id = Number(button.dataset.remove);
    writeApplications(readApplications().filter(item => item.id !== id));
    renderCabinet();
  });
})();
