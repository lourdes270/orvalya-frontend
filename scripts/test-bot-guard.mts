import { runRegistrationGuard } from '../src/lib/botProtection/runRegistrationGuard.ts'

async function main() {
  const honeypot = await runRegistrationGuard(
    { honeypot: 'bot-filled', captchaToken: 'any' },
    'auth-register',
  )
  console.log('HONEYPOT:', JSON.stringify(honeypot))

  const noCaptcha = await runRegistrationGuard(
    { honeypot: '', captchaToken: '' },
    'auth-register',
  )
  console.log('NO_CAPTCHA:', JSON.stringify(noCaptcha))
}

main()
