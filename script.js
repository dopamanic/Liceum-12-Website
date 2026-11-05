(function () {
  'use strict';

  const $  = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const focusableIn = scope =>
    $$(FOCUSABLE, scope).filter(el => !el.disabled && el.offsetParent !== null);

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
    }
  }

  setTheme(root.classList.contains('dark'));
  $('#theme-btn').addEventListener('click', () => setTheme(!root.classList.contains('dark')));

  const header = $('#header');
  const navLinks = $$('#nav .nav__link[href], #nav .nav__link[data-section]');
  let marks = [];
  let threshold = 0;
  let active = null;

  function measure() {
    threshold = header.offsetHeight + 48;
    marks = navLinks
      .map(link => {
        const section = $(link.dataset.section ?? link.getAttribute('href'));
        return section && { link, top: section.getBoundingClientRect().top + scrollY };
      })
      .filter(Boolean);
  }

  function update() {
    header.classList.toggle('is-stuck', scrollY > 8);

    const current = marks.filter(mark => mark.top <= scrollY + threshold).pop()?.link ?? null;
    if (current === active) return;

    active?.removeAttribute('aria-current');
    current?.setAttribute('aria-current', 'location');
    active = current;
  }

  let frame = 0;
  function onScroll() {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; update(); });
  }

  measure();
  update();
  addEventListener('scroll', onScroll, { passive: true });

  new ResizeObserver(() => { measure(); update(); }).observe(document.body);

  function closeMenu(menu) {
    menu.classList.remove('is-open');
    $('.menu__button', menu).setAttribute('aria-expanded', 'false');
  }

  $$('[data-menu]').forEach(menu => {
    const button = $('.menu__button', menu);

    button.addEventListener('click', event => {
      event.stopPropagation();
      button.setAttribute('aria-expanded', String(menu.classList.toggle('is-open')));
    });

    menu.addEventListener('focusout', event => {
      if (!menu.contains(event.relatedTarget)) closeMenu(menu);
    });

    $$('a', menu).forEach(link => link.addEventListener('click', () => closeMenu(menu)));
  });

  addEventListener('click', event => {
    $$('.menu.is-open').forEach(menu => {
      if (!menu.contains(event.target)) closeMenu(menu);
    });
  });

  const drawer = $('#drawer');
  const menuButton = $('#menu-btn');
  let lastFocused = null;
  let successTimer = 0;

  const openLayer = () =>
    $('.modal.is-open') ?? (drawer.dataset.open === 'true' ? drawer : null);

  function lockScroll() {
    document.body.style.overflow = openLayer() ? 'hidden' : '';
  }

  function setDrawer(open) {
    drawer.dataset.open = String(open);
    menuButton.setAttribute('aria-expanded', String(open));
    drawer.inert = !open;
    lockScroll();
  }

  function openModal(id) {
    const modal = $('#' + id);
    clearTimeout(successTimer);

    const from = document.activeElement;
    setDrawer(false);
    lastFocused = drawer.contains(from) ? menuButton : from;

    modal.classList.add('is-open');
    lockScroll();
    setTimeout(() => (focusableIn(modal).find(el => el.matches('.field')) ?? $('button', modal)).focus(), 60);
  }

  function closeModal(modal) {
    clearTimeout(successTimer);
    modal.classList.remove('is-open');
    lockScroll();
    lastFocused?.focus();
  }

  menuButton.addEventListener('click', () => setDrawer(true));
  $$('[data-close-drawer]').forEach(el => el.addEventListener('click', () => setDrawer(false)));
  $$('.drawer__link').forEach(link => link.addEventListener('click', () => setDrawer(false)));
  setDrawer(false);

  $$('[data-open-form]').forEach(button => {
    button.addEventListener('click', () => {
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
    modal.addEventListener('click', event => {
      if (event.target === modal) closeModal(modal);
    });
  });

  addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const menu = $('.menu.is-open');
      const modal = $('.modal.is-open');
      if (menu) closeMenu(menu);
      else if (modal) closeModal(modal);
      else if (drawer.dataset.open === 'true') setDrawer(false);
      return;
    }

    if (event.key !== 'Tab') return;

    const layer = openLayer();
    if (!layer) return;

    const items = focusableIn(layer);
    if (!items.length) return;

    if (!layer.contains(document.activeElement)) {
      event.preventDefault();
      items[0].focus();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    if (document.activeElement !== (event.shiftKey ? first : last)) return;

    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  });

  const STORE = 'applications';

  function readApplications() {
    try {
      const list = JSON.parse(localStorage.getItem(STORE));
      return Array.isArray(list)
        ? list.filter(item => item && typeof item.name === 'string')
        : [];
    } catch (e) {
      return [];
    }
  }

  function writeApplications(list) {
    try {
      localStorage.setItem(STORE, JSON.stringify(list));
    } catch (e) {
    }
  }

  const form = $('#enrol-form');
  const errorBox = $('#form-error');
  const okBox = $('#form-ok');

  function showError(message, field) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    field.setAttribute('aria-invalid', 'true');
    field.focus();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    errorBox.hidden = true;
    okBox.hidden = true;
    $$('[aria-invalid]', form).forEach(field => field.removeAttribute('aria-invalid'));

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

    if (name.length < 4 || !name.includes(' ')) {
      return showError('Вкажіть прізвище та ім’я учня повністю.', nameField);
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

    list.push({ id: Date.now(), name, grade, course, phone, email, owner: currentUser()?.login ?? null, created: new Date().toISOString() });
    writeApplications(list);

    form.reset();
    okBox.textContent = 'Заявку збережено. Ми зателефонуємо впродовж робочого дня.';
    okBox.hidden = false;

    successTimer = setTimeout(() => {
      closeModal($('#enrol-modal'));
      okBox.hidden = true;
    }, 2400);
  });

  const USERS = [
    { login: 'parent',  password: 'parent123',  name: 'Тест Батько',   role: 'Батьки',   sees: 'own' },
    { login: 'student', password: 'student123', name: 'Тест Учень',    role: 'Учень',    sees: 'own' },
    { login: 'teacher', password: 'teacher123', name: 'Тест Викладач', role: 'Викладач', sees: 'all' }
  ];

  const SESSION = 'session';

  function currentUser() {
    try {
      const login = localStorage.getItem(SESSION);
      return USERS.find(user => user.login === login) ?? null;
    } catch (e) {
      return null;
    }
  }

  function setSession(login) {
    try {
      if (login) localStorage.setItem(SESSION, login);
      else localStorage.removeItem(SESSION);
    } catch (e) {
    }
  }

  const cabinet = $('#cabinet-list');
  const cabinetEmpty = $('#cabinet-empty');
  const cabinetAccount = $('#cabinet-account');
  const cabinetTitle = $('#cabinet-title');
  const cabinetNote = $('#cabinet-note');
  const loginForm = $('#login-form');
  const loginError = $('#login-error');
  const loginField = $('#l-login');
  const passField = $('#l-pass');
  const rowTemplate = $('#cabinet-row');
  const formatDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

  $('#demo-list').replaceChildren(...USERS.map(user => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'demo__item';
    button.dataset.login = user.login;

    const name = document.createElement('span');
    name.textContent = user.role;
    const creds = document.createElement('code');
    creds.textContent = `${user.login} / ${user.password}`;

    button.append(name, creds);
    item.append(button);
    return item;
  }));

  $('#demo-list').addEventListener('click', event => {
    const button = event.target.closest('[data-login]');
    const user = button && USERS.find(item => item.login === button.dataset.login);
    if (!user) return;

    loginField.value = user.login;
    passField.value = user.password;
    loginError.hidden = true;
    $('button[type="submit"]', loginForm).focus();
  });

  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    loginError.hidden = true;

    const login = loginField.value.trim().toLowerCase();
    const user = USERS.find(item => item.login === login && item.password === passField.value);

    if (!user) {
      loginError.textContent = 'Невірний логін або пароль.';
      loginError.hidden = false;
      passField.value = '';
      passField.focus();
      return;
    }

    setSession(user.login);
    loginForm.reset();
    renderCabinet();
  });

  $('#logout-btn').addEventListener('click', () => {
    setSession(null);
    renderCabinet();
    loginField.focus();
  });

  function renderCabinet() {
    const user = currentUser();

    loginForm.hidden = Boolean(user);
    cabinetAccount.hidden = !user;
    cabinetTitle.textContent = user ? 'Мої заявки' : 'Вхід до кабінету';
    cabinetNote.textContent = user
      ? 'Збережені на цьому пристрої'
      : 'Увійдіть, щоб побачити свої заявки';

    if (!user) return;

    $('#account-name').textContent = user.name;
    $('#account-role').textContent = user.sees === 'all' ? `${user.role} · бачить усі заявки` : user.role;

    const list = readApplications().filter(item => user.sees === 'all' || item.owner === user.login);

    cabinet.replaceChildren();
    cabinet.hidden = list.length === 0;
    cabinetEmpty.hidden = list.length > 0;

    list.forEach(item => {
      const row = rowTemplate.content.firstElementChild.cloneNode(true);
      $('[data-name]', row).textContent = item.name;
      $('[data-course]', row).textContent = item.course;
      $('[data-when]', row).textContent =
        `${item.grade}, заявка від ${formatDate.format(new Date(item.created))}`;

      if (user.sees === 'all') {
        const contact = $('[data-contact]', row);
        contact.textContent = `${item.phone} · ${item.email}`;
        contact.hidden = false;
      }

      $('[data-remove]', row).dataset.remove = item.id;
      cabinet.append(row);
    });
  }

  cabinet.addEventListener('click', event => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;

    const id = Number(button.dataset.remove);
    writeApplications(readApplications().filter(item => item.id !== id));
    renderCabinet();
  });
})();
