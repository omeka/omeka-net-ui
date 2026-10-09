document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;
  var alertBanner = document.getElementById('alert-banner');
  var siteHeader = document.getElementById('site-header');
  var headerGroup = document.getElementById('site-header-group');
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.getElementById('site-nav');

  function setHeightVars() {
    var alertHeight = alertBanner && !body.classList.contains('hide-alert')
      ? alertBanner.offsetHeight
      : (alertBanner ? alertBanner.scrollHeight : 0);
    var headerHeight = siteHeader ? siteHeader.offsetHeight : 0;
    document.documentElement.style.setProperty('--alert-height', alertHeight + 'px');
    document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
  }

  if (headerGroup && alertBanner) {
    var lastScrollY = window.pageYOffset;
    var lastDocHeight = document.documentElement.scrollHeight;
    var scrollThreshold = 10;

    window.addEventListener('scroll', function () {
      var currentScrollY = window.pageYOffset;
      var docHeight = document.documentElement.scrollHeight;

      // A height change means .hide-alert reflowed the page (and the browser
      // clamped scroll); re-baseline instead of reading it as a scroll-up.
      if (docHeight !== lastDocHeight) {
        lastDocHeight = docHeight;
        lastScrollY = currentScrollY;
        return;
      }

      var delta = currentScrollY - lastScrollY;

      // Near the bottom, showing the alert would push the footer out of view.
      var hasRoomForAlert =
        docHeight - window.innerHeight - currentScrollY >= alertBanner.offsetHeight;

      if (currentScrollY <= scrollThreshold) {
        body.classList.remove('hide-alert');
      } else if (delta > 0) {
        body.classList.add('hide-alert');
      } else if (delta < 0 && hasRoomForAlert) {
        body.classList.remove('hide-alert');
      }

      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  if (navToggle && siteNav) {
    var setNavOpen = function (isOpen) {
      siteNav.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      body.classList.toggle('nav-open', isOpen);
    };

    navToggle.addEventListener('click', function () {
      setNavOpen(!siteNav.classList.contains('is-open'));
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setNavOpen(false);
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024 && siteNav.classList.contains('is-open')) {
        setNavOpen(false);
      }
    });

    // Suppress transitions when crossing the breakpoint, or the closed mobile
    // menu flashes into view and slides off during resize.
    var navBreakpoint = window.matchMedia('(min-width: 1024px)');
    var handleNavBreakpointChange = function () {
      body.classList.add('no-transitions');
      void body.offsetHeight;
      requestAnimationFrame(function () {
        body.classList.remove('no-transitions');
      });
    };
    if (navBreakpoint.addEventListener) {
      navBreakpoint.addEventListener('change', handleNavBreakpointChange);
    } else if (navBreakpoint.addListener) {
      navBreakpoint.addListener(handleNavBreakpointChange);
    }
  }

  setHeightVars();
  window.addEventListener('resize', setHeightVars);
  window.addEventListener('load', setHeightVars);

  var hostingToggle = document.getElementById('hosting-panel-toggle');
  var hostingPanel = document.getElementById('hosting-panel');

  if (hostingToggle && hostingPanel) {
    var hostingPill = hostingToggle.querySelector('.floating-hosting__pill');
    var hostingPillDefaultText = hostingPill ? hostingPill.textContent : '';

    hostingPanel.inert = true;

    var setHostingOpen = function (isOpen) {
      hostingPanel.classList.toggle('is-open', isOpen);
      hostingPanel.inert = !isOpen;
      hostingToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      if (hostingPill) {
        hostingPill.textContent = isOpen ? 'Close' : hostingPillDefaultText;
      }
    };

    hostingToggle.addEventListener('click', function () {
      setHostingOpen(hostingToggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && hostingToggle.getAttribute('aria-expanded') === 'true') {
        setHostingOpen(false);
        hostingToggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (
        hostingToggle.getAttribute('aria-expanded') === 'true' &&
        !hostingPanel.contains(e.target) &&
        !hostingToggle.contains(e.target)
      ) {
        setHostingOpen(false);
      }
    });
  }

  var siteNavMenu = document.querySelector('.site-nav__menu');

  if (siteNavMenu) {
    var pill = document.createElement('span');
    pill.className = 'site-nav__pill';
    pill.setAttribute('aria-hidden', 'true');
    siteNavMenu.insertBefore(pill, siteNavMenu.firstChild);

    var menuItems = Array.prototype.slice.call(siteNavMenu.querySelectorAll('li'));

    function getActiveItem() {
      var current = siteNavMenu.querySelector('a[aria-current="page"]');
      return current ? current.closest('li') : null;
    }

    function movePill(item) {
      if (!item) {
        pill.style.opacity = '0';
        return;
      }
      var menuRect = siteNavMenu.getBoundingClientRect();
      var itemRect = item.getBoundingClientRect();
      pill.style.width = itemRect.width + 'px';
      pill.style.height = itemRect.height + 'px';
      pill.style.transform = 'translate(' + (itemRect.left - menuRect.left) + 'px, ' + (itemRect.top - menuRect.top) + 'px)';
      pill.style.opacity = '1';
    }

    menuItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        movePill(item);
      });
    });

    siteNavMenu.addEventListener('mouseleave', function () {
      movePill(getActiveItem());
    });

    window.addEventListener('resize', function () {
      var hovered = menuItems.filter(function (item) {
        return item.matches(':hover');
      })[0];
      movePill(hovered || getActiveItem());
    });

    requestAnimationFrame(function () {
      pill.style.transition = 'none';
      movePill(getActiveItem());
      pill.getBoundingClientRect();
      pill.style.transition = '';
    });
  }
});
