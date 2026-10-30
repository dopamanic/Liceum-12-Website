/* ============================================================================
   Поведінка сторінки: тема, шапка, навігація, бічне меню, модалки,
   форма запису та кабінет заявок.

   Жодних залежностей. Усе в одній області видимості, щоб нічого
   не потрапляло в глобальний простір.
   ========================================================================= */

(function () {
  'use strict';

  const root = document.documentElement;
  const $  = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /* ========================================================================
     Тема
     Клас `dark` ставить config.js ще до першого рендеру, щоб не блимнуло
     світлою. Тут лишається тільки перемикання.
     ===================================================================== */

  const THEME_KEY = 'stemlab_theme';
  const themeColor = $('meta[name="theme-color"]');

  const applyTheme = (dark) => {
    root.classList.toggle('dark', dark);
    $('.i-sun').classList.toggle('hidden', dark);
    $('.i-moon').classList.toggle('hidden', !dark);
    themeColor.content = dark ? '#070F0E' : '#0A1413';
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch {
      /* приватний режим — тема просто не переживе перезавантаження */
    }
  };

  applyTheme(root.classList.contains('dark'));
  $('#theme-btn').addEventListener('click', () => {
    applyTheme(!root.classList.contains('dark'));
  });

  /* ========================================================================
     Шапка і підсвітка активного розділу

     Зсуви секцій міряємо один раз і кешуємо. Читати getBoundingClientRect
     на кожну подію скролу означало б змушувати браузер перераховувати
     розкладку десятки разів на секунду — а зсуви змінюються лише тоді,
     коли змінюється сама розкладка.
     ===================================================================== */

  const header = $('#hdr');
  const navLinks = $$('#nav a.h-link');
  let anchors = [];

  const measureAnchors = () => {
    anchors = navLinks
      .map((link) => {
        const section = $(link.getAttribute('href'));
        return section && { link, top: section.getBoundingClientRect().top + scrollY };
      })
      .filter(Boolean);
  };

  const updateOnScroll = () => {
    header.classList.toggle('solid', scrollY > 8);

    // Активний — останній розділ, верх якого вже пройшов під шапкою.
    const line = scrollY + 170;
    const current = anchors.filter((anchor) => anchor.top <= line).pop();
    anchors.forEach(({ link }) => {
      link.dataset.active = String(link === current?.link);
    });
  };

  // Події скролу приходять частіше за кадри — зводимо роботу до одного разу на кадр.
  let pendingFrame = 0;
  const onScroll = () => {
    if (pendingFrame) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0;
      updateOnScroll();
    });
  };

  measureAnchors();
  updateOnScroll();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { measureAnchors(); updateOnScroll(); });
  // Фотографії довантажуються після першого рендеру й зсувають секції нижче.
  addEventListener('load', () => { measureAnchors(); updateOnScroll(); });

  /* ========================================================================
     Випадайка «Напрямки»
     Відкриття по наведенню зроблене в CSS. Якби воно жило тут, наведення
     й клік перемикали б стан один одного: навів — відкрилось, клікнув —
     закрилось.
     ===================================================================== */

  const closeMenu = (menu) => {
    menu.classList.remove('open');
    $('button', menu).setAttribute('aria-expanded', 'false');
  };

  $$('[data-menu]').forEach((menu) => {
    const button = $('button', menu);

    button.addEventListener('click', (event) => {
      event.stopPropagation();   // інакше слухач нижче одразу ж закриє меню
      button.setAttribute('aria-expanded', String(menu.classList.toggle('open')));
    });

    menu.addEventListener('focusout', (event) => {
      if (!menu.contains(event.relatedTarget)) closeMenu(menu);
    });

    $$('a', menu).forEach((link) => {
      link.addEventListener('click', () => closeMenu(menu));
    });
  });

  // Один слухач на документ, а не по одному на кожне меню.
  addEventListener('click', (event) => {
    $$('.menu-wrap.open').forEach((menu) => {
      if (!menu.contains(event.target)) closeMenu(menu);
    });
  });

  /* ========================================================================
     Бічне меню та модалки

     Прокрутку сторінки блокує одне правило: заблокована, поки відкрите
     хоч щось. Інакше закриття одного шару знімало б блок, потрібний іншому.
     ===================================================================== */

  const drawer = $('#mob');
  const drawerButton = $('#mob-btn');
  let lastFocused = null;

  const syncScrollLock = () => {
    const locked = drawer.dataset.open === 'true' || Boolean($('.modal.open'));
    document.body.style.overflow = locked ? 'hidden' : '';
  };

  const setDrawer = (open) => {
    drawer.dataset.open = String(open);
    drawerButton.setAttribute('aria-expanded', String(open));
    drawer.inert = !open;   // прибирає вміст із Tab і з читача екрана
    syncScrollLock();
  };

  const openModal = (id) => {
    const modal = $(`#${id}`);
    lastFocused = document.activeElement;
    setDrawer(false);
    modal.classList.add('open');
    syncScrollLock();
    // Фокус на перше поле; у кабінеті полів немає, тому на першу кнопку.
    setTimeout(() => ($('.field', modal) ?? $('button', modal)).focus(), 60);
  };

  const closeModal = (modal) => {
    modal.classList.remove('open');
    syncScrollLock();
    lastFocused?.focus();
  };

  drawerButton.addEventListener('click', () => setDrawer(true));
  $('#mob-close').addEventListener('click', () => setDrawer(false));
  $('.drawer-bg', drawer).addEventListener('click', () => setDrawer(false));
  $$('.mob-lnk', drawer).forEach((link) => {
    link.addEventListener('click', () => setDrawer(false));
  });
  setDrawer(false);   // початковий стан: закрите й inert

  $$('.reg-trig').forEach((button) => {
    button.addEventListener('click', () => {
      // У <option> немає атрибута value, тому значення дорівнює тексту.
      if (button.dataset.course) $('#f-course').value = button.dataset.course;
      openModal('reg-modal');
    });
  });

  $$('.cab-trig').forEach((button) => {
    button.addEventListener('click', () => {
      renderCabinet();
      openModal('cab-modal');
    });
  });

  $$('.modal-x').forEach((button) => {
    button.addEventListener('click', () => closeModal(button.closest('.modal')));
  });

  $$('.modal').forEach((modal) => {
    // Клік саме по підкладці, а не по вмісту картки.
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  /* ========================================================================
     Клавіатура
     Esc закриває верхній шар; Tab не випускає фокус із відкритої модалки.
     ===================================================================== */

  addEventListener('keydown', (event) => {
    const modal = $('.modal.open');

    if (event.key === 'Escape') {
      const menu = $('.menu-wrap.open');
      if (menu) closeMenu(menu);
      else if (modal) closeModal(modal);
      else if (drawer.dataset.open === 'true') setDrawer(false);
      return;
    }

    if (event.key !== 'Tab' || !modal) return;

    const focusable = $$('a[href], button, input, select, textarea', modal)
      .filter((element) => !element.disabled && element.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const edge = event.shiftKey ? first : last;
    if (document.activeElement !== edge) return;

    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  });

  /* ========================================================================
     Заявки
     Зберігаються лише в браузері відвідувача. Коли зʼявиться сервер,
     переписати доведеться тільки ці дві функції.
     ===================================================================== */

  const STORE_KEY = 'stemlab_applications';

  const readApplications = () => {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) ?? [];
    } catch {
      return [];   // сховище заблоковане або в ньому сміття
    }
  };

  const writeApplications = (applications) => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(applications));
    } catch {
      /* сховище переповнене або заблоковане — мовчки пропускаємо */
    }
  };

  /* ========================================================================
     Форма запису
     ===================================================================== */

  const form = $('#reg-form');
  const errorBox = $('#f-error');
  const successBox = $('#f-ok');

  const showError = (message, field) => {
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
    field.focus();
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    errorBox.classList.add('hidden');
    successBox.classList.add('hidden');

    const fields = {
      name:   $('#f-name'),
      grade:  $('#f-grade'),
      course: $('#f-course'),
      phone:  $('#f-phone'),
      email:  $('#f-email'),
    };

    const name = fields.name.value.trim();
    const phone = fields.phone.value.trim();
    const email = fields.email.value.trim();
    const { value: grade } = fields.grade;
    const { value: course } = fields.course;

    // Перевірки по черзі: перша невдала зупиняє відправку й веде фокус до поля.
    if (name.length < 4 || !name.includes(' ')) {
      return showError('Вкажіть прізвище та імʼя учня повністю.', fields.name);
    }
    if (!grade)  return showError('Оберіть клас.', fields.grade);
    if (!course) return showError('Оберіть напрямок.', fields.course);
    if (phone.replace(/\D/g, '').length < 9) {
      return showError('Вкажіть телефон у форматі +38 0XX XXX XX XX.', fields.phone);
    }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
      return showError('Перевірте електронну пошту.', fields.email);
    }

    const applications = readApplications();
    const alreadyEnrolled = applications.some(
      (application) =>
        application.name.toLowerCase() === name.toLowerCase() && application.course === course
    );
    if (alreadyEnrolled) {
      return showError(`${name} уже записаний на «${course}».`, fields.name);
    }

    applications.push({
      id: Date.now(),
      name, grade, course, phone, email,
      created: new Date().toISOString(),
    });
    writeApplications(applications);

    form.reset();
    successBox.textContent = 'Заявку збережено. Ми зателефонуємо впродовж робочого дня.';
    successBox.classList.remove('hidden');

    setTimeout(() => {
      closeModal($('#reg-modal'));
      successBox.classList.add('hidden');
    }, 2400);
  });

  /* ========================================================================
     Кабінет заявок

     Розмітку рядка тримає <template> в index.html, а не рядок усередині JS.
     Так вона лишається видимою в HTML, а текст підставляється через
     textContent — тобто екранування не потрібне взагалі.
     ===================================================================== */

  const cabinetList = $('#cab-list');
  const cabinetEmpty = $('#cab-empty');
  const rowTemplate = $('#cab-row');
  const formatDate = new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  function renderCabinet() {
    const applications = readApplications();

    cabinetList.replaceChildren();
    cabinetList.classList.toggle('hidden', applications.length === 0);
    cabinetEmpty.classList.toggle('hidden', applications.length > 0);

    applications.forEach((application) => {
      const row = rowTemplate.content.firstElementChild.cloneNode(true);
      $('[data-name]', row).textContent = application.name;
      $('[data-course]', row).textContent = application.course;
      $('[data-meta]', row).textContent =
        `${application.grade} · заявка від ${formatDate.format(new Date(application.created))}`;
      $('[data-remove]', row).dataset.remove = application.id;
      cabinetList.append(row);
    });
  }

  // Делегування: один слухач переживає всі перемальовування списку.
  cabinetList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;

    const id = Number(button.dataset.remove);
    writeApplications(readApplications().filter((application) => application.id !== id));
    renderCabinet();
  });
})();
