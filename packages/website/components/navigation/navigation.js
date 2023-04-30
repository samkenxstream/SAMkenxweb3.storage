import { useCallback, useState, useMemo, Fragment } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';

// @ts-ignore
import { useAuthorization } from 'components/contexts/authorizationContext';
import ZeroAccordion from 'ZeroComponents/accordion/accordion';
import ZeroAccordionSection from 'ZeroComponents/accordion/accordionSection';
import { events, saEvent, ui } from 'lib/analytics';
import Loading from 'components/loading/loading';
import Breadcrumbs from 'components/breadcrumbs/breadcrumbs';
import Sidebar from 'modules/docs-theme/sidebar/sidebar';
import Button from '../button/button';
import SiteLogo from '../../assets/icons/w3storage-logo.js';
import Hamburger from '../../assets/icons/hamburger.js';
import GradientBackground from '../gradientbackground/gradientbackground.js';
import GeneralPageData from '../../content/pages/general.json';
import Search from 'components/search/search';
import StorageLimitRequestModal from 'components/storageLimitRequestModal/storageLimitRequestModal';
import Link from '../link/link';

/**
 * Navbar Component
 *
 * @param {Object} props
 * @param {Boolean} props.isProductApp
 * @param {import('../breadcrumbs/breadcrumbs').Breadcrumb[]} [props.breadcrumbs]
 */
export default function Navigation({ breadcrumbs, isProductApp }) {
  const router = useRouter();
  const { isLoggedIn, isLoading, isFetching, logout } = useAuthorization();
  const isLoadingUser = useMemo(() => isLoading || isFetching, [isLoading, isFetching]);
  // component State
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isUserRequestModalOpen, setIsUserRequestModalOpen] = useState(false);
  // Navigation Content
  const links = GeneralPageData.navigation.links;
  const account = links?.find(item => item.text.toLowerCase() === 'account');

  const navItems = links.filter(item => item.text.toLowerCase() !== 'account');
  const auth = GeneralPageData.navigation.auth;
  const logoText = GeneralPageData.site_logo.text;
  const theme = isProductApp ? 'light' : 'dark';
  const buttonTheme = isProductApp ? 'pink-blue' : '';
  const isDocs = router.route.includes('docs');

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const onLinkClick = useCallback(
    e => {
      saEvent(events.LINK_CLICK_NAVBAR, { target: e.currentTarget });

      if (isMenuOpen) {
        setMenuOpen(false);
      }
    },
    [isMenuOpen]
  );

  const login = useCallback(() => {
    router.push('/login');
    if (isMenuOpen) {
      setMenuOpen(false);
    }
  }, [router, isMenuOpen]);

  // ======================================================= Templates [Buttons]
  const getAccountMenu = () => {
    if (account && account.links) {
      return (
        <div className="nav-dd-button">
          <Link
            href={account.url}
            onClick={onLinkClick}
            className={clsx('nav-item', account.url === router.route ? 'current-page' : '')}
          >
            {account.text}
          </Link>
          <div className="nav-dropdown">
            {account.links.map(link =>
              link.url === 'request-more-storage' ? (
                <button
                  key={link.text}
                  onClick={() => setIsUserRequestModalOpen(true)}
                  className={clsx(['nav-dropdown-button'])}
                >
                  {link.text}
                </button>
              ) : (
                <Link
                  href={link.url}
                  key={link.text}
                  className={clsx(
                    'nav-dropdown-link',
                    link.url === router.asPath || link.url === router.route ? 'current-route' : ''
                  )}
                  onClick={onLinkClick}
                >
                  {link.text}
                </Link>
              )
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const logoutButton = (button, forceTheme) => {
    const variant = forceTheme || theme;
    return (
      <Button
        id="nav-auth-button"
        onClick={logout}
        variant={variant}
        tracking={{
          event: events.LOGOUT_CLICK,
          ui: ui.NAVBAR,
          action: 'Logout',
        }}
      >
        {button.text}
      </Button>
    );
  };

  const loginButton = (button, forceTheme) => {
    const variant = forceTheme || theme;
    return (
      <Button
        id="nav-auth-button"
        href={button.url}
        onClick={login}
        variant={variant}
        tracking={{
          ui: ui.NAVBAR,
          action: 'Login',
        }}
      >
        {button.text}
      </Button>
    );
  };

  const loadingButton = (button, forceTheme) => {
    const variant = forceTheme || theme;
    return (
      <Button href="#" id="nav-auth-button" variant={variant}>
        <span className="navigation-loader-text">{button.text}</span>
        <Loading className="navigation-loader" size="medium" color={variant === 'dark' ? 'white' : 'black'} />
      </Button>
    );
  };

  // ================================================ Main Template [Navigation]
  return (
    <section id="section_navigation" className={clsx('section-navigation', theme, isProductApp ? 'clear-bg' : '')}>
      <div className="grid">
        <div className="col">
          <nav id="navigation">
            <div
              className={clsx(
                'nav-bar',
                isMenuOpen ? 'mobile-panel' : '',
                router.route === '/' ? 'breadcrumbs-hidden' : ''
              )}
            >
              <div className={clsx('site-logo-container', theme, isMenuOpen ? 'menu-open' : '')}>
                <Link className="anchor-wrapper" href="/" onClick={onLinkClick}>
                  <SiteLogo className="site-logo-image" />
                  <div className={clsx('site-logo-text', theme, isMenuOpen ? 'menu-open' : '')}>{logoText}</div>
                </Link>
              </div>

              <div className={clsx('nav-items-wrapper', theme)}>
                {navItems.map((item, i) => (
                  <Fragment key={item.text}>
                    {item.links ? (
                      <div className="nav-dd-button">
                        <Link
                          key={item.text}
                          href={item.url}
                          className={clsx('nav-item', item.url === router.route ? 'current-page' : '')}
                          onClick={onLinkClick}
                        >
                          {item.text}
                        </Link>
                        <div className="nav-dropdown">
                          {item.links.map(link => (
                            <Link
                              key={link.text}
                              href={link.url}
                              className={clsx('nav-dropdown-link', link.url === router.route ? 'current-page' : '')}
                              onClick={onLinkClick}
                            >
                              {link.text}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        target={item.text === 'Blog' ? '_blank' : '_self'}
                        key={item.text}
                        href={item.url}
                        className={clsx('nav-item', item.url === router.route ? 'current-page' : '')}
                        onClick={onLinkClick}
                      >
                        {item.text}
                      </Link>
                    )}
                  </Fragment>
                ))}

                {isLoggedIn && getAccountMenu()}

                {isLoadingUser
                  ? loadingButton(auth.login, buttonTheme)
                  : isLoggedIn
                  ? logoutButton(auth.logout, buttonTheme)
                  : loginButton(auth.login, buttonTheme)}
                <Search />
              </div>

              <div className={clsx('nav-menu-toggle', theme, isMenuOpen ? 'menu-open' : '')}>
                <Search />
                <button onClick={toggleMenu}>
                  <Hamburger aria-label="Toggle Navbar" />
                </button>
              </div>
            </div>

            {breadcrumbs && <Breadcrumbs variant={theme} click={onLinkClick} items={breadcrumbs} />}

            <div className={clsx('nav-mobile-panel grid', isMenuOpen ? 'open' : '')} aria-hidden={isMenuOpen}>
              <div className="mobile-nav-gradient-wrapper">
                <GradientBackground variant={null} />
              </div>

              <div className="mobile-items-wrapper">
                {navItems.map((item, index) => (
                  <Fragment key={item.text}>
                    {item.links ? (
                      <ZeroAccordion multiple={false} toggleOnLoad={false} toggleAllOption={false}>
                        <ZeroAccordionSection disabled={!Array.isArray(item.links)} trackingId={item.text}>
                          <ZeroAccordionSection.Header>
                            <div className="nav-item-heading">{item.text}</div>
                          </ZeroAccordionSection.Header>

                          <ZeroAccordionSection.Content>
                            {Array.isArray(item.links) && (
                              <div className="nav-sublinks-wrapper">
                                {item.links.map(link => (
                                  <Link
                                    href={link.url}
                                    key={link.text}
                                    onClick={onLinkClick}
                                    className={clsx('nav-sublink', link.url === router.route ? 'current-page' : '')}
                                  >
                                    {link.text}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </ZeroAccordionSection.Content>
                        </ZeroAccordionSection>
                      </ZeroAccordion>
                    ) : (
                      <Link href={item.url} key={`mobile-${item.text}`} className="nav-item" onClick={onLinkClick}>
                        {item.text}
                      </Link>
                    )}
                  </Fragment>
                ))}

                {isDocs && <Sidebar openMenu={setMenuOpen} />}

                {isLoggedIn && account && (
                  <ZeroAccordion multiple={false} toggleOnLoad={false} toggleAllOption={false}>
                    <ZeroAccordionSection disabled={!Array.isArray(account.links)} trackingId={account.text}>
                      <ZeroAccordionSection.Header>
                        <div className="nav-item-heading">{account.text}</div>
                      </ZeroAccordionSection.Header>

                      <ZeroAccordionSection.Content>
                        {Array.isArray(account.links) && (
                          <div className="nav-sublinks-wrapper">
                            {account.links.map(link =>
                              link.url === 'request-more-storage' ? (
                                <button
                                  key={link.text}
                                  onClick={() => setIsUserRequestModalOpen(true)}
                                  className={clsx(['nav-sublink', 'a'])}
                                >
                                  {link.text}
                                </button>
                              ) : (
                                <Link href={link.url} key={link.text} onClick={onLinkClick} className="nav-sublink">
                                  {link.text}
                                </Link>
                              )
                            )}
                          </div>
                        )}
                      </ZeroAccordionSection.Content>
                    </ZeroAccordionSection>
                  </ZeroAccordion>
                )}

                {isLoadingUser
                  ? loadingButton(auth.login, 'light')
                  : isLoggedIn
                  ? logoutButton(auth.logout, 'light')
                  : loginButton(auth.login, 'light')}
              </div>
            </div>
          </nav>
        </div>
      </div>
      <StorageLimitRequestModal isOpen={isUserRequestModalOpen} onClose={() => setIsUserRequestModalOpen(false)} />
    </section>
  );
}
