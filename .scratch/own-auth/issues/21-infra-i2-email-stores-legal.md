# I2 · Email deliverability, app store submissions, provider consoles, legal pages and contact address

Status: ready-for-human
Type: task
Blocked by: 19
Tracker card: I2

- [ ] `MAIL_FROM` domain: SPF, DKIM, DMARC passing (mail-tester); provider sending limit confirmed for the all-user mailings at 10/s (announce at T-7 and reminder at T-1, both sent by the `announce` command from the `user` table through the existing mail queue, R3; then the transition emails and `back` after the window); `MAIL_CONTACT` set to the address the team reads; no staging sink in production.
- [ ] Stores: production build submitted at T-7 and held; descriptions updated (new login; update, then use the emailed link or Forgot password; Google, Facebook and Apple sign-in); App Store id noted for the Update required screen and the banner; store credentials holder for the window.
- [ ] Provider consoles: Google OAuth client ids (iOS, Android with the EAS keystore SHA-1, web client as audience); Facebook app live with Facebook Login and `email`, iOS bundle and Android package + key hash; Apple Services id and Sign in with Apple enabled for `org.commitglobal.vic` under the team from issue 00.
- [ ] Legal pages: privacy policy and terms describe VIC holding passwords, the statute upload, social sign-in through VIC, NGO Hub no longer involved; mobile links, the web registration terms link and the email footer (`contactEmail` from `MailService`) point at VIC's pages and `MAIL_CONTACT` (`faq-tc.hbs` is not rendered, R31).

## Comments
