import type { Page } from '@playwright/test'

const HCAPTCHA_MOCK_SCRIPT = `
(function () {
  var token = 'e2e-mock-captcha-token';
  var respKey = 'e2e-mock-resp-key';
  var widgetSeq = 0;

  function createMock() {
    return {
      render: function (container, opts) {
        var id = 'e2e-widget-' + (++widgetSeq);
        setTimeout(function () {
          if (opts && typeof opts.callback === 'function') {
            opts.callback(token, respKey);
          }
        }, 50);
        return id;
      },
      getResponse: function () { return token; },
      getRespKey: function () { return respKey; },
      reset: function () {},
      remove: function () {},
      execute: function () { return Promise.resolve({ response: token, key: respKey }); },
      setData: function () {},
      close: function () {},
    };
  }

  window.hcaptcha = createMock();
  if (typeof window.hCaptchaOnLoad === 'function') {
    window.hCaptchaOnLoad();
  }
})();
`

export async function setupE2EMocks(page: Page): Promise<void> {
  await page.route('**/functions/v1/verify-captcha', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  })

  await page.route('**/*hcaptcha.com/**', async route => {
    const url = route.request().url()
    if (url.includes('api.js') || url.includes('secure-api.js')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: HCAPTCHA_MOCK_SCRIPT,
      })
      return
    }
    await route.fulfill({ status: 200, contentType: 'text/plain', body: '' })
  })

  await page.route('**api.ipify.org**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ip: '127.0.0.1' }),
    })
  })
  await page.route('**api64.ipify.org**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ip: '127.0.0.1' }),
    })
  })

  await page.addInitScript(() => {
    const token = 'e2e-mock-captcha-token'
    const respKey = 'e2e-mock-resp-key'
    let widgetSeq = 0
    const mock = {
      render: (_container: HTMLElement, opts: { callback?: (t: string, k: string) => void }) => {
        const id = `e2e-widget-${++widgetSeq}`
        window.setTimeout(() => opts.callback?.(token, respKey), 50)
        return id
      },
      getResponse: () => token,
      getRespKey: () => respKey,
      reset: () => {},
      remove: () => {},
      execute: () => Promise.resolve({ response: token, key: respKey }),
      setData: () => {},
      close: () => {},
    }
    // @ts-expect-error mock hCaptcha global
    window.hcaptcha = mock
  })
}

export async function clearRegistroTipo(page: Page): Promise<void> {
  await page.addInitScript(() => {
    sessionStorage.removeItem('orvalya_registro_tipo')
  })
}

export async function setRegistroContratante(page: Page): Promise<void> {
  await page.addInitScript(() => {
    sessionStorage.setItem('orvalya_registro_tipo', 'contratante')
  })
}
