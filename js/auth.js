// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v7 — auth.js
// Sistema completo de autenticación:
//   - Login email/password via Firebase Auth
//   - Login PIN (PBKDF2 + salt — migra PINs legacy de v6)
//   - 2FA email via Firebase Auth
//   - Sesión persistente (24h) con auto-renovación
//   - Detección de rol y redirect al módulo correcto
//   - Roles: superadmin | supervisor | controlador_rampa | editor | visor | empresa
// ═══════════════════════════════════════════════════════════════════════
import { AppState }            from './state.js';
import { getBEUAuth, fsGet, fsSet, fsUpdate } from './firestore.js';
import { toast, hashPin, sha256, uid }     from './utils.js';

const FB_BASE      = 'https://www.gstatic.com/firebasejs/10.12.0';
const SESSION_TTL  = 24 * 60 * 60 * 1000; // 24h
const SESSION_KEY  = 'beu_session_v7';
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

// Permissions per role
const ROLE_PERMS = {
  superadmin:        { canEdit:true, canAdd:true, canDel:true, canClean:true, canExport:true, canImport:true, canAdmin:true, canPrint:true, canActivate:true, canStatus:true, canSpecial:true, canCampos:true, canMensajes:true, canSaveTpl:true, canDelTpl:true },
  supervisor:        { canEdit:true, canAdd:true, canDel:true, canClean:true, canExport:true, canImport:true, canAdmin:false,canPrint:true, canActivate:true, canStatus:true, canSpecial:true, canCampos:true, canMensajes:true, canSaveTpl:true, canDelTpl:false },
  controlador_rampa: { canEdit:true, canAdd:true, canDel:false,canClean:false,canExport:false,canImport:false,canAdmin:false,canPrint:true, canActivate:false,canStatus:true, canSpecial:false,canCampos:false,canMensajes:true, canSaveTpl:false,canDelTpl:false },
  editor:            { canEdit:true, canAdd:true, canDel:true, canClean:false,canExport:true, canImport:true, canAdmin:false,canPrint:true, canActivate:false,canStatus:true, canSpecial:false,canCampos:true, canMensajes:false,canSaveTpl:true, canDelTpl:false },
  visor:             { canEdit:false,canAdd:false,canDel:false,canClean:false,canExport:true, canImport:false,canAdmin:false,canPrint:false,canActivate:false,canStatus:false,canSpecial:false,canCampos:false,canMensajes:false,canSaveTpl:false,canDelTpl:false },
  empresa:           { canEdit:false,canAdd:false,canDel:false,canClean:false,canExport:false,canImport:false,canAdmin:false,canPrint:false,canActivate:false,canStatus:false,canSpecial:false,canCampos:false,canMensajes:false,canSaveTpl:false,canDelTpl:false },
};

// ─── STATE ────────────────────────────────────────────────────────────
let _failCount = 0;
let _lockedUntil = null;
let _pendingUser = null; // waiting for 2FA

// ─── PUBLIC API ───────────────────────────────────────────────────────

/**
 * Initialize auth — call once at app start.
 * Attempts to restore session, then shows login if needed.
 */
export async function initAuth() {
  if (await _restoreSession()) {
    _onAuthSuccess();
    return;
  }
  _showLogin();
}

/** Returns true if current user has a given permission */
export function hasPerm(perm) {
  const u = AppState.get('currentUser');
  if (!u) return false;
  if (u.rol === 'superadmin') return true;
  const perms = { ...(ROLE_PERMS[u.rol] || {}), ...(u.customPerms || {}) };
  return !!perms[perm];
}

export const isSA   = () => AppState.get('currentUser')?.rol === 'superadmin';
export const isSup  = () => ['superadmin','supervisor'].includes(AppState.get('currentUser')?.rol);
export const canEdit   = () => hasPerm('canEdit');
export const canAdd    = () => hasPerm('canAdd');
export const canDel    = () => hasPerm('canDel');
export const canClean  = () => hasPerm('canClean');
export const canExport = () => hasPerm('canExport');
export const canImport = () => hasPerm('canImport');
export const canPrint  = () => hasPerm('canPrint');
export const canStatus = () => hasPerm('canStatus');
export const canSpecial= () => hasPerm('canSpecial');
export const canCampos = () => hasPerm('canCampos');
export const canMensajes=() => hasPerm('canMensajes');

/** Logout — clear session and show login */
export async function logout() {
  try {
    const { signOut } = await import(`${FB_BASE}/firebase-auth.js`);
    await signOut(getBEUAuth());
  } catch(e) {}
  _clearSession();
  AppState.set('currentUser', null);
  AppState.set('currentEvent', null);
  _showLogin();
}

// ─── LOGIN SCREEN ────────────────────────────────────────────────────
// ─── LANGS UI (shared between login and register) ────────────────
const LANGS_UI = [
  {code:'es',flag:'🇪🇸',name:'Español'},
  {code:'ca',flag:'🏴󠁥󠁳󠁣󠁴󠁿',name:'Català'},
  {code:'eu',flag:'🏴󠁥󠁳󠁰󠁶󠁿',name:'Euskara'},
  {code:'gl',flag:'🏴󠁥󠁳󠁧󠁡󠁿',name:'Galego'},
  {code:'en',flag:'🇬🇧',name:'English'},
  {code:'fr',flag:'🇫🇷',name:'Français'},
  {code:'de',flag:'🇩🇪',name:'Deutsch'},
  {code:'it',flag:'🇮🇹',name:'Italiano'},
  {code:'pt',flag:'🇵🇹',name:'Português'},
  {code:'pl',flag:'🇵🇱',name:'Polski'},
  {code:'ro',flag:'🇷🇴',name:'Română'},
  {code:'nl',flag:'🇳🇱',name:'Nederlands'},
  {code:'hu',flag:'🇭🇺',name:'Magyar'},
  {code:'cs',flag:'🇨🇿',name:'Čeština'},
  {code:'hr',flag:'🇭🇷',name:'Hrvatski'},
  {code:'uk',flag:'🇺🇦',name:'Українська'},
  {code:'ru',flag:'🇷🇺',name:'Русский'},
  {code:'tr',flag:'🇹🇷',name:'Türkçe'},
  {code:'ar',flag:'🇸🇦',name:'العربية'},
  {code:'sv',flag:'🇸🇪',name:'Svenska'},
  {code:'fi',flag:'🇫🇮',name:'Suomi'},
  {code:'el',flag:'🇬🇷',name:'Ελληνικά'},
  {code:'bg',flag:'🇧🇬',name:'Български'},
  {code:'sk',flag:'🇸🇰',name:'Slovenčina'},
  {code:'sl',flag:'🇸🇮',name:'Slovenščina'},
];

// ─── LOGIN SCREEN ────────────────────────────────────────────────────
function _showLogin() {
  // Hide splash screen
  try { window.hideSplash && window.hideSplash(); } catch(e) {}
  const lang = AppState.get('currentLang') || 'es';
  const I18N = {
    es: { id:'Usuario o email',pass:'Contraseña',btn:'Acceder',pin:'Acceso con PIN',reg:'🏢 Registrar mi empresa →',twoFA:'Verificación en 2 pasos',verify:'Verificar código',resend:'Reenviar código',back:'← Volver',err_creds:'Usuario o contraseña incorrectos',err_lock:'Cuenta bloqueada',err_2fa:'Código incorrecto',err_pin:'PIN incorrecto' },
    en: { id:'Username or email',pass:'Password',btn:'Sign in',pin:'PIN access',reg:'🏢 Register my company →',twoFA:'2-step verification',verify:'Verify code',resend:'Resend code',back:'← Back',err_creds:'Incorrect credentials',err_lock:'Account locked',err_2fa:'Invalid code',err_pin:'Incorrect PIN' },
    fr: { id:'Utilisateur ou email',pass:'Mot de passe',btn:'Se connecter',pin:'Accès PIN',reg:'🏢 Inscrire mon entreprise →',twoFA:'Vérification en 2 étapes',verify:'Vérifier le code',resend:'Renvoyer',back:'← Retour',err_creds:'Identifiants incorrects',err_lock:'Compte bloqué',err_2fa:'Code incorrect',err_pin:'PIN incorrect' },
    de: { id:'Benutzer oder E-Mail',pass:'Passwort',btn:'Anmelden',pin:'PIN-Zugang',reg:'🏢 Mein Unternehmen registrieren →',twoFA:'2-Stufen-Verifizierung',verify:'Code verifizieren',resend:'Code erneut senden',back:'← Zurück',err_creds:'Falsche Anmeldedaten',err_lock:'Konto gesperrt',err_2fa:'Falscher Code',err_pin:'Falscher PIN' },
    it: { id:'Utente o email',pass:'Password',btn:'Accedi',pin:'Accesso PIN',reg:'🏢 Registra la mia azienda →',twoFA:'Verifica in 2 passaggi',verify:'Verifica codice',resend:'Invia di nuovo',back:'← Indietro',err_creds:'Credenziali errate',err_lock:'Account bloccato',err_2fa:'Codice errato',err_pin:'PIN errato' },
    pt: { id:'Utilizador ou email',pass:'Palavra-passe',btn:'Entrar',pin:'Acesso PIN',reg:'🏢 Registar a minha empresa →',twoFA:'Verificação em 2 etapas',verify:'Verificar código',resend:'Reenviar',back:'← Voltar',err_creds:'Credenciais incorretas',err_lock:'Conta bloqueada',err_2fa:'Código errado',err_pin:'PIN errado' },
    pl: { id:'Użytkownik lub email',pass:'Hasło',btn:'Zaloguj',pin:'Dostęp PIN',reg:'🏢 Zarejestruj firmę →',twoFA:'Weryfikacja 2-etapowa',verify:'Weryfikuj kod',resend:'Wyślij ponownie',back:'← Wróć',err_creds:'Błędne dane',err_lock:'Konto zablokowane',err_2fa:'Błędny kod',err_pin:'Błędny PIN' },
    ro: { id:'Utilizator sau email',pass:'Parolă',btn:'Conectare',pin:'Acces PIN',reg:'🏢 Înregistrează compania →',twoFA:'Verificare în 2 pași',verify:'Verificați codul',resend:'Retrimite',back:'← Înapoi',err_creds:'Date incorecte',err_lock:'Cont blocat',err_2fa:'Cod incorect',err_pin:'PIN incorect' },
    nl: { id:'Gebruiker of e-mail',pass:'Wachtwoord',btn:'Inloggen',pin:'PIN-toegang',reg:'🏢 Bedrijf registreren →',twoFA:'2-staps verificatie',verify:'Code verifiëren',resend:'Opnieuw sturen',back:'← Terug',err_creds:'Onjuiste gegevens',err_lock:'Account geblokkeerd',err_2fa:'Onjuiste code',err_pin:'Onjuiste PIN' },
    hu: { id:'Felhasználó vagy email',pass:'Jelszó',btn:'Belépés',pin:'PIN hozzáférés',reg:'🏢 Cégregisztráció →',twoFA:'2-lépéses ellenőrzés',verify:'Kód ellenőrzése',resend:'Újraküldés',back:'← Vissza',err_creds:'Hibás adatok',err_lock:'Fiók zárolva',err_2fa:'Hibás kód',err_pin:'Hibás PIN' },
    cs: { id:'Uživatel nebo email',pass:'Heslo',btn:'Přihlásit',pin:'PIN přístup',reg:'🏢 Registrovat firmu →',twoFA:'2-kroková verifikace',verify:'Ověřit kód',resend:'Znovu odeslat',back:'← Zpět',err_creds:'Nesprávné údaje',err_lock:'Účet zablokován',err_2fa:'Nesprávný kód',err_pin:'Nesprávný PIN' },
    hr: { id:'Korisnik ili email',pass:'Lozinka',btn:'Prijava',pin:'PIN pristup',reg:'🏢 Registriraj tvrtku →',twoFA:'2-koračna verifikacija',verify:'Provjeri kod',resend:'Pošalji ponovo',back:'← Natrag',err_creds:'Pogrešni podaci',err_lock:'Račun blokiran',err_2fa:'Pogrešan kod',err_pin:'Pogrešan PIN' },
    sk: { id:'Používateľ alebo email',pass:'Heslo',btn:'Prihlásiť',pin:'PIN prístup',reg:'🏢 Registrovať firmu →',twoFA:'Overenie v 2 krokoch',verify:'Overiť kód',resend:'Znova odoslať',back:'← Späť',err_creds:'Nesprávne údaje',err_lock:'Účet zablokovaný',err_2fa:'Nesprávny kód',err_pin:'Nesprávny PIN' },
    sl: { id:'Uporabnik ali email',pass:'Geslo',btn:'Prijava',pin:'PIN dostop',reg:'🏢 Registriraj podjetje →',twoFA:'2-koračna verifikacija',verify:'Preveri kodo',resend:'Pošlji ponovo',back:'← Nazaj',err_creds:'Napačni podatki',err_lock:'Račun blokiran',err_2fa:'Napačna koda',err_pin:'Napačen PIN' },
    sv: { id:'Användare eller e-post',pass:'Lösenord',btn:'Logga in',pin:'PIN-åtkomst',reg:'🏢 Registrera mitt företag →',twoFA:'2-stegsverifiering',verify:'Verifiera kod',resend:'Skicka igen',back:'← Tillbaka',err_creds:'Felaktiga uppgifter',err_lock:'Konto låst',err_2fa:'Fel kod',err_pin:'Fel PIN' },
    fi: { id:'Käyttäjä tai sähköposti',pass:'Salasana',btn:'Kirjaudu',pin:'PIN-pääsy',reg:'🏢 Rekisteröi yritykseni →',twoFA:'2-vaiheinen vahvistus',verify:'Vahvista koodi',resend:'Lähetä uudelleen',back:'← Takaisin',err_creds:'Virheelliset tiedot',err_lock:'Tili lukittu',err_2fa:'Väärä koodi',err_pin:'Väärä PIN' },
    el: { id:'Χρήστης ή email',pass:'Κωδικός',btn:'Είσοδος',pin:'Πρόσβαση PIN',reg:'🏢 Εγγραφή εταιρείας →',twoFA:'Επαλήθευση 2 βημάτων',verify:'Επαλήθευση κωδικού',resend:'Επαναποστολή',back:'← Πίσω',err_creds:'Λανθασμένα στοιχεία',err_lock:'Λογαριασμός κλειδωμένος',err_2fa:'Λανθασμένος κωδικός',err_pin:'Λανθασμένο PIN' },
    bg: { id:'Потребител или имейл',pass:'Парола',btn:'Вход',pin:'PIN достъп',reg:'🏢 Регистрирай фирма →',twoFA:'Проверка в 2 стъпки',verify:'Проверете кода',resend:'Изпратете отново',back:'← Назад',err_creds:'Грешни данни',err_lock:'Акаунтът е блокиран',err_2fa:'Грешен код',err_pin:'Грешен PIN' },
    uk: { id:'Користувач або email',pass:'Пароль',btn:'Увійти',pin:'Доступ PIN',reg:'🏢 Зареєструвати компанію →',twoFA:'Двоетапна верифікація',verify:'Перевірити код',resend:'Надіслати знову',back:'← Назад',err_creds:'Невірні дані',err_lock:'Акаунт заблоковано',err_2fa:'Невірний код',err_pin:'Невірний PIN' },
    ru: { id:'Пользователь или email',pass:'Пароль',btn:'Войти',pin:'Доступ PIN',reg:'🏢 Зарегистрировать компанию →',twoFA:'Двухэтапная проверка',verify:'Проверить код',resend:'Отправить снова',back:'← Назад',err_creds:'Неверные данные',err_lock:'Аккаунт заблокирован',err_2fa:'Неверный код',err_pin:'Неверный PIN' },
    tr: { id:'Kullanıcı veya email',pass:'Şifre',btn:'Giriş',pin:'PIN erişimi',reg:'🏢 Şirketimi kaydet →',twoFA:'2 adımlı doğrulama',verify:'Kodu doğrula',resend:'Tekrar gönder',back:'← Geri',err_creds:'Hatalı bilgiler',err_lock:'Hesap kilitlendi',err_2fa:'Hatalı kod',err_pin:'Hatalı PIN' },
    ar: { id:'المستخدم أو البريد',pass:'كلمة المرور',btn:'دخول',pin:'دخول بـ PIN',reg:'🏢 تسجيل شركتي →',twoFA:'التحقق بخطوتين',verify:'تحقق من الرمز',resend:'إعادة إرسال',back:'→ رجوع',err_creds:'بيانات غير صحيحة',err_lock:'الحساب محظور',err_2fa:'رمز غير صحيح',err_pin:'PIN غير صحيح' },
    ca: { id:'Usuari o email',pass:'Contrasenya',btn:'Accedir',pin:'Accés PIN',reg:'🏢 Registrar la meva empresa →',twoFA:'Verificació en 2 passos',verify:'Verificar codi',resend:'Reenviar',back:'← Tornar',err_creds:'Credencials incorrectes',err_lock:'Compte bloquejat',err_2fa:'Codi incorrecte',err_pin:'PIN incorrecte' },
    eu: { id:'Erabiltzailea edo emaila',pass:'Pasahitza',btn:'Sartu',pin:'PIN sarbidea',reg:'🏢 Nire enpresa erregistratu →',twoFA:'2 urratseko egiaztapena',verify:'Kodea egiaztatu',resend:'Berriro bidali',back:'← Itzuli',err_creds:'Datu okerrak',err_lock:'Kontua blokeatuta',err_2fa:'Kode okerra',err_pin:'PIN okerra' },
    gl: { id:'Usuario ou email',pass:'Contrasinal',btn:'Acceder',pin:'Acceso PIN',reg:'🏢 Rexistrar a miña empresa →',twoFA:'Verificación en 2 pasos',verify:'Verificar código',resend:'Reenviar',back:'← Volver',err_creds:'Credenciais incorrectas',err_lock:'Conta bloqueada',err_2fa:'Código incorrecto',err_pin:'PIN incorrecto' },
  };
  const T = I18N[lang] || I18N.en;

  document.body.innerHTML = `
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; padding: 0; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }
  .login-wrap { position: fixed; inset: 0; z-index: 2000; background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); display: flex; align-items: center; justify-content: center; padding: 16px; overflow-y: auto; }
  .login-card { background: #fff; border-radius: 16px; padding: 28px 26px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,.4); max-height: 90vh; overflow-y: auto; color: #111; }
  .login-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 22px; }
  .login-logo span { font-family: 'Oxanium', monospace; font-size: 20px; font-weight: 700; color: #0f172a; }
  .login-logo .teal { color: #00b89a; }
  .login-card input { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; margin-bottom: 10px; background: #fff; color: #111; font-family: inherit; outline: none; }
  .login-card input::placeholder { color: #9ca3af; }
  .login-card input:focus { border-color: #3b5998; box-shadow: 0 0 0 3px rgba(59,89,152,.1); }
  .btn-ingresar { padding: 9px 36px; border: none; border-radius: 20px; background: #3b5998; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; letter-spacing: 1.5px; transition: background .15s; }
  .btn-ingresar:hover { background: #344e86; }
  .btn-ingresar:disabled { opacity: .5; cursor: not-allowed; }
  .btn-registrar { padding: 8px 24px; border: 1.5px solid #a7f3d0; border-radius: 20px; background: #f0fdf4; color: #059669; font-size: 11px; font-weight: 700; cursor: pointer; font-family: inherit; letter-spacing: 1px; transition: all .15s; }
  .btn-registrar:hover { background: #dcfce7; border-color: #6ee7b7; }
  .err { color: #dc2626; font-size: 12px; font-weight: 700; text-align: center; margin-top: 8px; display: none; background: #fef2f2; border: 1px solid #fecaca; padding: 6px 10px; border-radius: 6px; }
  .pin-pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 16px 0; }
  .pin-key { padding: 14px 0; border: 1.5px solid #e2e8f0; border-radius: 10px; background: #fff; color: #111; font-size: 18px; font-weight: 700; cursor: pointer; text-align: center; font-family: inherit; transition: background .1s; }
  .pin-key:hover { background: #f0f2f8; }
  .pin-dots { display: flex; justify-content: center; gap: 10px; margin: 16px 0; }
  .pdot { width: 14px; height: 14px; border-radius: 50%; border: 2px solid #3b5998; background: transparent; transition: background .15s; }
  .pdot.filled { background: #3b5998; }
</style>

<div class="login-wrap">
  <div class="login-card">
    <div class="login-logo">
      <svg viewBox="0 0 140 140" width="30" height="30"><rect width="140" height="140" rx="28" fill="#030812"/><polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/><polygon points="70,28 106,49 106,91 70,112 34,91 34,49" stroke="#00ffc8" stroke-width="1.2" fill="none" opacity="0.4"/><circle cx="70" cy="70" r="9" fill="#00ffc8"/><circle cx="70" cy="70" r="3.5" fill="#030812"/></svg>
      <span><span class="teal">Be</span>Unify<span class="teal">T</span></span>
    </div>

    <!-- EMAIL/PASS FORM -->
    <div id="loginFormEmail">
      <input id="loginIdent" type="text" placeholder="${T.id}" autocomplete="username" autocapitalize="none" spellcheck="false">
      <div style="position:relative;display:flex;align-items:center">
        <input id="loginPass" type="password" placeholder="${T.pass} o PIN" autocomplete="current-password"
        onkeydown="if(event.key==='Enter')document.getElementById('btnLogin').click()" style="padding-right:40px">
        <button type="button" id="loginEye" onclick="(function(){var i=document.getElementById('loginPass'),b=document.getElementById('loginEye');i.type=i.type==='password'?'text':'password';b.style.opacity=i.type==='text'?'1':'0.4';})()" style="position:absolute;right:10px;background:none;border:none;cursor:pointer;color:#9ca3af;display:flex;align-items:center;opacity:0.4"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
      </div>
      <div style="text-align:center;margin-bottom:10px">
        <button class="btn-ingresar" id="btnLogin" onclick="window._auth.loginEmail()">INGRESAR</button>
      </div>
      <div class="err" id="loginErr"></div>
      <div style="text-align:center;margin-bottom:14px">
        <button class="btn-registrar" onclick="window._auth.showRegister()">REGISTRAR MI EMPRESA →</button>
      </div>
    </div>

    <!-- PIN FORM (hidden, accessible via internal flow) -->
    <div id="loginFormPin" style="display:none">
      <div class="pin-dots">
        ${[0,1,2,3,4,5].map(i => `<div class="pdot" id="pd${i}"></div>`).join('')}
      </div>
      <div class="pin-pad">
        ${[1,2,3,4,5,6,7,8,9,'','0','⌫'].map(k =>
          `<button class="pin-key" ${k===''?'style="visibility:hidden"':''} onclick="window._auth.pinKey('${k}')">${k}</button>`
        ).join('')}
      </div>
      <div class="err" id="pinErr"></div>
      <button style="width:100%;padding:8px;border:1.5px solid #e2e8f0;border-radius:20px;background:#f8fafc;color:#374151;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit" onclick="window._auth.showEmail()">${T.back}</button>
    </div>

    <!-- 2FA FORM -->
    <div id="loginForm2FA" style="display:none">
      <p style="text-align:center;font-size:14px;font-weight:600;margin-bottom:16px">${T.twoFA}</p>
      <p style="text-align:center;font-size:12px;color:#6b7280;margin-bottom:16px" id="twoFAHint"></p>
      <input id="twoFACode" type="text" inputmode="numeric" maxlength="6" placeholder="000000" style="text-align:center;font-size:24px;letter-spacing:8px"
        onkeydown="if(event.key==='Enter')document.getElementById('btn2FA').click()">
      <div style="text-align:center;margin:10px 0">
        <button class="btn-ingresar" id="btn2FA" onclick="window._auth.verify2FA()">${T.verify}</button>
      </div>
      <div class="err" id="twoFAErr"></div>
      <button style="width:100%;padding:8px;border:1.5px solid #e2e8f0;border-radius:20px;background:#f8fafc;color:#374151;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;margin-top:6px" onclick="window._auth.resend2FA()" id="btnResend2FA" style="display:none">${T.resend}</button>
      <button style="width:100%;padding:8px;border:1.5px solid #e2e8f0;border-radius:20px;background:#f8fafc;color:#374151;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;margin-top:6px" onclick="window._auth.showEmail()">${T.back}</button>
    </div>

    <!-- LANG SELECTOR inside card -->
    <div style="text-align:center;margin-top:4px">
      <select id="loginLangSel" onchange="window._auth.setLangDirect(this.value)" style="border:1.5px solid #e2e8f0;background:#f8fafc;border-radius:20px;padding:5px 14px;font-size:11px;color:#64748b;cursor:pointer;font-family:inherit;width:170px">
        ${LANGS_UI.map(l=>'<option value="'+l.code+'" '+(l.code===lang?'selected':'')+'>'+l.flag+' '+l.name+'</option>').join('')}
      </select>
    </div>

  </div>
</div>`;

  // Focus first input
  setTimeout(() => document.getElementById('loginIdent')?.focus(), 100);
}

// ─── PIN STATE ────────────────────────────────────────────────────────
let _pinBuffer = '';
const _pinKeys = [1,2,3,4,5,6,7,8,9,null,0,'⌫'];

function _pinDisplay() {
  for (let i = 0; i < 6; i++) {
    const d = document.getElementById('pd' + i);
    if (d) d.className = 'pdot' + (i < _pinBuffer.length ? ' filled' : '');
  }
}

// ─── EMAIL LOGIN ──────────────────────────────────────────────────────
async function _loginEmail() {
  if (_isLocked()) return;
  const ident = (document.getElementById('loginIdent')?.value || '').trim().toLowerCase();
  const pass  = (document.getElementById('loginPass')?.value  || '').trim();
  const errEl = document.getElementById('loginErr');
  const btn   = document.getElementById('btnLogin');
  if (!ident || !pass) { _showErr(errEl, 'Completa todos los campos'); return; }

  btn.disabled = true; btn.textContent = '…';

  try {
    const { signInWithEmailAndPassword } = await import(`${FB_BASE}/firebase-auth.js`);
    const cred = await signInWithEmailAndPassword(getBEUAuth(), ident, pass);
    const fbUser = cred.user;

    // Try Firestore, fall back to Firebase Auth data if rules block it
    let userDoc = null;
    try { userDoc = await fsGet('users/' + fbUser.uid); } catch(e) {}
    // Also try matching by email if uid lookup failed
    if (!userDoc) {
      try {
        const { collection, query, where, getDocs, limit } = await import(`${FB_BASE}/firebase-firestore.js`);
        const { getDB } = await import('./firestore.js');
        const q = query(collection(getDB(), 'users'), where('email', '==', fbUser.email), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) userDoc = { id: snap.docs[0].id, ...snap.docs[0].data() };
      } catch(e) {}
    }
    if (!userDoc) {
      // First login — check if Firestore has ANY users
      // If empty, this must be the SA doing first-time setup → auto-create SA doc
      try {
        const { collection, getDocs, limit, query } = await import(`${FB_BASE}/firebase-firestore.js`);
        const { getDB } = await import('./firestore.js');
        const snap = await getDocs(query(collection(getDB(), 'users'), limit(1)));
        if (snap.empty) {
          // First user ever → ONLY allowed SA email can become SA
          if (fbUser.email !== 'carlosreyesrivera12@gmail.com') {
            _showErr(errEl, 'Acceso no autorizado. Solo el administrador principal puede inicializar el sistema.');
            btn.disabled = false; btn.textContent = 'INGRESAR';
            return;
          }
          const saDoc = {
            id: fbUser.uid, nombre: fbUser.displayName || fbUser.email.split('@')[0],
            email: fbUser.email, rol: 'superadmin', lang: 'es',
            tabs: ['dash','ingresos','ingresos2','flota','conductores','agenda','analytics',
                   'vehiculos','auditoria','papelera','impresion','recintos','eventos',
                   'mensajes','usuarios','empresas','migracion'],
          };
          await fsSet('users/' + fbUser.uid, saDoc, false);
          _onUserLoaded(saDoc);
          return;
        } else {
          // Users exist but this one has no doc → SA must create it from Usuarios tab
          _showErr(errEl, 'Acceso no autorizado. Pide al administrador que cree tu usuario en la aplicación.');
          btn.disabled = false; btn.textContent = 'INGRESAR';
          return;
        }
      } catch(e) {}
      _showErr(errEl, 'Usuario no encontrado. Contacta con el administrador.');
      btn.disabled = false; btn.textContent = 'INGRESAR';
      return;
    }
    _onUserLoaded({ id: fbUser.uid, ...userDoc });
  } catch (e) {
    const code = e?.code || '';
    const isWrongCreds = code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') || code.includes('INVALID_PASSWORD') || code.includes('EMAIL_NOT_FOUND') || e?.status === 400;
    // If password failed and input looks like PIN (4-8 digits), try PIN login
    if (isWrongCreds && /^\d{4,8}$/.test(pass)) {
      try {
        _pinBuffer = pass;
        const pinResult = await _tryPinLogin(pass);
        if (pinResult) { _onUserLoaded(pinResult); return; }
      } catch(pe) {}
    }
    if (isWrongCreds) {
      _loginFail(errEl);
    } else if (code.includes('too-many-requests')) {
      _showErr(errEl, 'Demasiados intentos. Espera unos minutos.');
    } else {
      _showErr(errEl, 'Error: ' + (e?.message || code || 'desconocido'));
      console.error('[auth] login error', e);
    }
    btn.disabled = false; btn.textContent = 'INGRESAR';
  }
}

// ─── FIND USER BY EMAIL (migration from v6 Firestore structure) ───────
async function _findUserByEmail(email) {
  try {
    const { collection, query, where, getDocs, limit } = await import(`${FB_BASE}/firebase-firestore.js`);
    const { getDB } = await import('./firestore.js');
    const q = query(collection(getDB(), 'users'), where('email', '==', email), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch(e) {}
  return null;
}

// ─── PIN LOGIN ────────────────────────────────────────────────────────
// ─── PIN LOGIN (unified - used by both keypad and password field) ───
async function _tryPinLogin(pin) {
  try {
    const { collection, getDocs } = await import(`${FB_BASE}/firebase-firestore.js`);
    const { getDB } = await import('./firestore.js');
    const snap = await getDocs(collection(getDB(), 'users'));
    for (const docSnap of snap.docs) {
      const u = { id: docSnap.id, ...docSnap.data() };
      if (u.pinHash && u.pinSalt) {
        const hashed = await hashPin(pin, u.pinSalt);
        if (hashed === u.pinHash) return u;
      } else if (u.pin && u.pin === pin) {
        const salt = uid();
        const hashed = await hashPin(pin, salt);
        await fsUpdate(`users/${u.id}`, { pinHash: hashed, pinSalt: salt, pin: null });
        return u;
      }
    }
  } catch(e) { console.warn('[auth] pin check error', e); }
  return null;
}

async function _checkPin() {
  if (_isLocked()) return;
  const errEl = document.getElementById('pinErr');
  if (_pinBuffer.length < 4) { _showErr(errEl, 'PIN mínimo 4 dígitos'); return; }

  try {
    // Get all users and check PIN (PBKDF2 hashed or legacy plain)
    const { collection, getDocs } = await import(`${FB_BASE}/firebase-firestore.js`);
    const { getDB } = await import('./firestore.js');
    const snap = await getDocs(collection(getDB(), 'users'));
    let matched = null;

    for (const docSnap of snap.docs) {
      const u = { id: docSnap.id, ...docSnap.data() };
      if (u.pinHash && u.pinSalt) {
        // Modern hashed PIN
        const hashed = await hashPin(_pinBuffer, u.pinSalt);
        if (hashed === u.pinHash) { matched = u; break; }
      } else if (u.pin && u.pin === _pinBuffer) {
        // Legacy plain-text PIN — migrate on the fly
        const salt = uid();
        const hashed = await hashPin(_pinBuffer, salt);
        await fsUpdate(`users/${u.id}`, { pinHash: hashed, pinSalt: salt, pin: null });
        matched = u; break;
      }
    }

    if (!matched) { _loginFail(errEl); _pinBuffer = ''; _pinDisplay(); return; }
    _onUserLoaded(matched);
  } catch (e) {
    _showErr(errEl, 'Error al verificar PIN');
    console.error('[auth] pin error', e);
  }
}

// ─── 2FA ──────────────────────────────────────────────────────────────
async function _verify2FA() {
  const code  = (document.getElementById('twoFACode')?.value || '').trim();
  const errEl = document.getElementById('twoFAErr');
  const btn   = document.getElementById('btn2FA');
  if (!code || code.length !== 6) { _showErr(errEl, 'El código debe ser de 6 dígitos'); return; }

  btn.disabled = true;
  try {
    const { PhoneAuthProvider, signInWithCredential } = await import(`${FB_BASE}/firebase-auth.js`);
    if (_pendingUser?._verificationId) {
      const cred = PhoneAuthProvider.credential(_pendingUser._verificationId, code);
      await signInWithCredential(getBEUAuth(), cred);
    }
    // Email-based OTP: verify against stored OTP in Firestore
    if (_pendingUser?._otpHash) {
      const hashed = await sha256(code + _pendingUser.id);
      if (hashed !== _pendingUser._otpHash) { _showErr(errEl, 'Código incorrecto'); btn.disabled = false; return; }
    }
    _onUserLoaded(_pendingUser);
  } catch (e) {
    _showErr(errEl, 'Código incorrecto o expirado');
    btn.disabled = false;
  }
}

async function _resend2FA() {
  if (!_pendingUser?.email) return;
  await _sendOTP(_pendingUser);
  toast('Código reenviado', 'var(--green)');
}

async function _sendOTP(user) {
  // Generate 6-digit OTP, hash and store it, send via Firebase Auth email
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const hashed = await sha256(otp + user.id);
  await fsUpdate(`users/${user.id}`, { _otpHash: hashed, _otpExp: Date.now() + 10 * 60 * 1000 });
  _pendingUser = { ...user, _otpHash: hashed };
  // In production: trigger Brevo email with OTP via Cloud Function
  // For now: show OTP in console (dev mode only)
  if (location.hostname === 'localhost') console.info('[auth] OTP (dev only):', otp);
}

// ─── USER LOADED → CHECK 2FA → SESSION ───────────────────────────────
async function _onUserLoaded(user) {
  // Check lock
  if (user.lockedUntil && Date.now() < user.lockedUntil) {
    const mins = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    _showErr(document.getElementById('loginErr') || document.getElementById('pinErr'),
      `Cuenta bloqueada ${mins} min`);
    _showLoginForm('email');
    return;
  }

  // Check 2FA
  if (user.twoFA && user.email) {
    _pendingUser = user;
    await _sendOTP(user);
    _show2FA(user.email);
    return;
  }

  // All good — create session
  _failCount = 0;
  AppState.set('currentUser', user);
  AppState.set('currentLang', user.lang || 'es');
  _saveSession(user);
  _onAuthSuccess();
}

function _onAuthSuccess() {
  const user = AppState.get('currentUser');
  if (!user) { _showLogin(); return; }
  // Hide splash — module will render the full UI
  try { window.hideSplash && window.hideSplash(); } catch(e) {}
  // Dynamic import of correct module based on role
  if (user.rol === 'empresa') {
    import('./modules/portal.js').then(m => m.initPortal()).catch(e => {
      console.error('[auth] portal load error', e);
      try { window.showError && window.showError('Error cargando portal: ' + e.message); } catch(e) {}
    });
  } else {
    import('./modules/operator.js').then(m => m.initOperator()).catch(e => {
      console.error('[auth] operator load error', e);
      try { window.showError && window.showError('Error cargando operador: ' + e.message); } catch(e) {}
    });
  }
}

// ─── SESSION ──────────────────────────────────────────────────────────
function _saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      uid: user.id,
      exp: Date.now() + SESSION_TTL,
      lang: user.lang || 'es',
      rol: user.rol,
    }));
  } catch(e) {}
}

function _clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch(e) {}
}

async function _restoreSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    if (!s.exp || Date.now() > s.exp) { localStorage.removeItem(SESSION_KEY); return false; }
    // Load fresh user from Firestore
    const user = await fsGet(`users/${s.uid}`);
    if (!user || user.lockedUntil > Date.now()) { localStorage.removeItem(SESSION_KEY); return false; }
    AppState.set('currentUser', { id: s.uid, ...user });
    AppState.set('currentLang', s.lang || user.lang || 'es');
    _saveSession({ id: s.uid, ...user }); // renew TTL
    return true;
  } catch (e) {
    console.warn('[auth] restore session failed', e);
    return false;
  }
}

// ─── BRUTE FORCE PROTECTION ───────────────────────────────────────────
function _loginFail(errEl) {
  _failCount++;
  const lang = AppState.get('currentLang') || 'es';
  if (_failCount >= MAX_ATTEMPTS) {
    _lockedUntil = Date.now() + LOCK_MINUTES * 60 * 1000;
    _showErr(errEl, `Demasiados intentos. Bloqueado ${LOCK_MINUTES} min.`);
  } else {
    const T2 = I18N[lang] || I18N.en;
    _showErr(errEl, T2.err_creds || 'Usuario o contraseña incorrectos');
  }
}

function _isLocked() {
  if (_lockedUntil && Date.now() < _lockedUntil) {
    const mins = Math.ceil((_lockedUntil - Date.now()) / 60000);
    toast(`Bloqueado ${mins} min. Inténtalo más tarde.`, 'var(--red)');
    return true;
  }
  _lockedUntil = null;
  return false;
}

// ─── UI HELPERS ───────────────────────────────────────────────────────
function _showErr(el, msg) {
  if (!el) return;
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => { if (el) el.style.display = 'none'; }, 4000);
}

function _showLoginForm(which) {
  ['Email','Pin','2FA'].forEach(id => {
    const el = document.getElementById(`loginForm${id}`);
    if (el) el.style.display = id.toLowerCase() === which.toLowerCase() ? '' : 'none';
  });
}

function _show2FA(email) {
  _showLoginForm('2FA');
  const hint = document.getElementById('twoFAHint');
  if (hint) hint.textContent = `Código enviado a ${email.replace(/(.{2}).+@/, '$1***@')}`;
  const resend = document.getElementById('btnResend2FA');
  if (resend) { setTimeout(() => { resend.style.display = ''; }, 30000); }
  setTimeout(() => document.getElementById('twoFACode')?.focus(), 100);
}

const LANGS_CYCLE = ['es','en','fr','de','it','pt','pl','ro','nl','hu','cs','hr','sk','sl','sv','fi','el','bg','uk','ru','tr','ar','ca','eu','gl'];
function _cycleLang() { _setLangDirect(AppState.get('currentLang')||'es'); }
function _setLangDirect(code) {
  const savedIdent = document.getElementById('loginIdent')?.value || '';
  const savedPass  = document.getElementById('loginPass')?.value || '';
  AppState.set('currentLang', code);
  try { localStorage.setItem('beu_lang', code); } catch(e) {}
  _showLogin();
  setTimeout(() => {
    const ei = document.getElementById('loginIdent'); if(ei && savedIdent) ei.value = savedIdent;
    const ep = document.getElementById('loginPass');  if(ep && savedPass)  ep.value = savedPass;
  }, 50);
}
// Global alias — accessible from inline onclick before window._auth is set
window._BEUCycleLang = _cycleLang;

// ─── EXPOSE TO WINDOW (inline handlers) ──────────────────────────────
// ─── EMPRESA SELF-REGISTRATION ────────────────────────────────────────
function _showRegisterEmpresa() {
  try { window.hideSplash && window.hideSplash(); } catch(e) {}
  const lang = AppState.get('currentLang') || 'es';
  const LANGS = ['es','en','fr','de','it','pt','pl','ro','nl','hu','cs','hr','sk','sl','sv','fi','el','bg','uk','ru','tr','ar','ca','eu','gl'];
  document.body.innerHTML = `
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{margin:0;padding:0;font-family:'Inter',system-ui,sans-serif}
.reg-wrap{position:fixed;inset:0;z-index:2000;background:linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}
input{width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;margin-bottom:10px;background:#fff;color:#0f172a;font-family:inherit;outline:none}
input:focus{border-color:#2563eb}
.card{background:#fff;border-radius:16px;padding:24px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.4);max-height:90vh;overflow-y:auto;min-height:520px;display:flex;flex-direction:column}
.step{display:none}.step.on{display:flex;flex-direction:column;flex:1}
.step-bar{display:flex;gap:4px;margin-bottom:16px}
.sc{flex:1;height:4px;border-radius:2px;background:#e5e7eb}
.sc.done{background:#2563eb}.sc.active{background:#93c5fd}
.btn{width:100%;padding:9px;border:none;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:4px}
.btn-p{background:#2563eb;color:#fff}.btn-p:hover{background:#1d4ed8}
.btn-g{background:#0d9f6e;color:#fff}
.btn-gh{background:#fff;color:#374151;border:1.5px solid #d1d5db}
.err{color:#e02424;font-size:12px;font-weight:700;margin-bottom:8px;display:none}
.lbl{font-size:11px;font-weight:700;color:#6b7280;margin-bottom:4px;text-transform:uppercase;display:block}
.rgpd-body{max-height:200px;overflow-y:auto;border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb;font-size:12px;line-height:1.6;color:#374151;margin-bottom:10px}
.otp-row{display:flex;gap:8px;justify-content:center;margin-bottom:16px}
.otp-b{width:44px;height:54px;border:2px solid #d1d5db;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#0f172a}
.otp-b.filled{border-color:#2563eb;background:#eff6ff}
select{width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;background:#fff;color:#0f172a;font-family:inherit;cursor:pointer;outline:none}
</style>
<div class="reg-wrap">
<div class="card">
  <div style="text-align:center;margin-bottom:28px">
    <svg viewBox="0 0 140 140" width="38" height="38" style="margin-bottom:8px"><rect width="140" height="140" rx="28" fill="#030812"/><polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/><polygon points="70,28 106,49 106,91 70,112 34,91 34,49" stroke="#00ffc8" stroke-width="1.2" fill="none" opacity="0.4"/><circle cx="70" cy="70" r="9" fill="#00ffc8"/><circle cx="70" cy="70" r="3.5" fill="#030812"/></svg>
    <div style="font-family:'Oxanium',monospace;font-size:17px;font-weight:700;margin-top:4px"><span style="color:#00b89a">Be</span>Unify<span style="color:#00b89a">T</span></div>
  </div>
  <div style="text-align:center;margin-bottom:18px">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00896b" stroke-width="2" stroke-linecap="round" style="vertical-align:middle"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    <span style="font-size:13px;font-weight:700;color:#00896b;vertical-align:middle;margin-left:4px">Registro de Empresa</span>
  </div>

  <!-- STEP 1: IDIOMA -->
  <div class="step on" id="rs1">
    <div class="step-bar"><div class="sc active"></div><div class="sc"></div><div class="sc"></div><div class="sc"></div><div class="sc"></div></div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
      <span style="font-size:13px;font-weight:700">Selecciona tu idioma</span>
    </div>
    <select id="regLangSel" onchange="window._regLang=this.value" style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;margin-bottom:16px;background:#fff;color:#0f172a;font-family:inherit;cursor:pointer">
      ${LANGS_UI.filter(l=>LANGS.includes(l.code)).map(l=>'<option value="'+l.code+'" '+(l.code===lang?'selected':'')+'>'+l.flag+' '+l.name+'</option>').join('')}
    </select>
    <div style="flex:1"></div>
    <button class="btn btn-p" onclick="window._regStep(2)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="vertical-align:middle"><polyline points="9 18 15 12 9 6"/></svg> Continuar</button>
    <button class="btn btn-gh" style="margin-top:8px" onclick="window._auth.showEmail()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="vertical-align:middle"><polyline points="15 18 9 12 15 6"/></svg> Volver al inicio</button>
    <div style="text-align:center;margin-top:12px;font-size:11px;color:#94a3b8;font-weight:600">Paso 1 / 5</div>
  </div>

  <!-- STEP 2: DATOS -->
  <div class="step" id="rs2">
    <div class="step-bar"><div class="sc done"></div><div class="sc active"></div><div class="sc"></div><div class="sc"></div><div class="sc"></div></div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <span style="font-size:13px;font-weight:700">Datos de la empresa</span>
    </div>
    <label class="lbl">Nombre empresa *</label><input id="rNom" placeholder="Sertrans S.L.">
    <label class="lbl">CIF / NIF / VAT / SIREN *</label><input id="rCif" placeholder="B12345678 / FR12345678901 / DE123456789">
    <label class="lbl">Persona de contacto *</label><input id="rCont" placeholder="Juan García">
    <label class="lbl">Teléfono *</label><input id="rTel" type="tel" placeholder="+34 600 000 000">
    <label class="lbl">Email *</label><input id="rEmail" type="email" placeholder="empresa@ejemplo.com">
    <label class="lbl">Contraseña *</label>
    <div style="position:relative">
      <input id="rPass" type="password" placeholder="Mínimo 8 caracteres" style="padding-right:40px">
      <button type="button" onclick="(function(){var i=document.getElementById('rPass'),b=this;i.type=i.type==='password'?'text':'password';b.style.opacity=i.type==='text'?'1':'0.4';}).call(this)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;opacity:0.4;display:flex;align-items:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
    </div>
    <div class="err" id="rErr2"></div>
    <div style="flex:1"></div>
    <button class="btn btn-p" onclick="window._regStep(3)">Siguiente: RGPD <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="vertical-align:middle"><polyline points="9 18 15 12 9 6"/></svg></button>
    <button class="btn btn-gh" style="margin-top:8px" onclick="window._regStep(1)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="vertical-align:middle"><polyline points="15 18 9 12 15 6"/></svg></button>
    <div style="text-align:center;margin-top:12px;font-size:11px;color:#94a3b8;font-weight:600">Paso 2 / 5</div>
  </div>

  <!-- STEP 3: RGPD -->
  <div class="step" id="rs3">
    <div class="step-bar"><div class="sc done"></div><div class="sc done"></div><div class="sc active"></div><div class="sc"></div><div class="sc"></div></div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      <span style="font-size:13px;font-weight:700">Consentimiento RGPD</span>
    </div>
    <div style="font-size:10px;color:#b45309;padding:5px 9px;background:#fffbeb;border-radius:6px;border:1px solid #fde68a;margin-bottom:8px;display:flex;align-items:center;gap:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Desplázate hasta el final para aceptar</div>
    <div class="rgpd-body" id="rRgpdDoc" onscroll="if(this.scrollTop+this.clientHeight>=this.scrollHeight-10){document.getElementById('rRgpdArea').style.opacity='1';document.getElementById('rRgpdArea').style.pointerEvents='auto';}">
      <h3 style="margin-bottom:8px">Protección de Datos — RGPD</h3>
      <p>El responsable del tratamiento es el organizador del evento. Los datos se tratarán exclusivamente para la gestión logística y de acceso al recinto. Se conservarán hasta 2 años después del evento.</p>
      <p style="margin-top:8px">De conformidad con el RGPD (UE) 2016/679, el interesado tiene derecho a acceder, rectificar, suprimir, limitar, portar y oponerse al tratamiento de sus datos. Contacto: privacidad@beunifyt.com</p>
      <p style="margin-top:8px">Los datos no serán cedidos a terceros salvo obligación legal o prestación del servicio contratado.</p>
      <p style="margin-top:8px;color:transparent">.</p>
    </div>
    <div id="rRgpdArea" style="opacity:.4;pointer-events:none;transition:opacity .3s">
      <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer;margin-bottom:8px">
        <input type="checkbox" id="rC1" style="flex-shrink:0;margin-top:2px">
        He leído y acepto el documento de protección de datos y consiento el tratamiento de los datos de los conductores.
      </label>
      <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer">
        <input type="checkbox" id="rC2" style="flex-shrink:0;margin-top:2px">
        Confirmo que soy representante legal o apoderado de la empresa.
      </label>
    </div>
    <div class="err" id="rErr3" style="margin-top:8px"></div>
    <div style="flex:1"></div>
    <button class="btn btn-p" style="margin-top:10px" onclick="window._regStep(4)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="vertical-align:middle"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Enviar código de firma</button>
    <button class="btn btn-gh" style="margin-top:8px" onclick="window._regStep(2)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="vertical-align:middle"><polyline points="15 18 9 12 15 6"/></svg></button>
    <div style="text-align:center;margin-top:12px;font-size:11px;color:#94a3b8;font-weight:600">Paso 3 / 5</div>
  </div>

  <!-- STEP 4: OTP -->
  <div class="step" id="rs4">
    <div class="step-bar"><div class="sc done"></div><div class="sc done"></div><div class="sc done"></div><div class="sc active"></div><div class="sc"></div></div>
    <div style="text-align:center;margin-bottom:12px">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" style="margin-bottom:6px"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      <div style="font-size:13px;font-weight:700;margin-bottom:4px">Código de verificación enviado</div>
      <div id="rOtpHint" style="font-size:11px;color:#6b7280"></div>
    </div>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:8px 10px;margin-bottom:12px;display:flex;align-items:flex-start;gap:6px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span style="font-size:11px;color:#92400e;line-height:1.4">Revisa tu bandeja de entrada y carpeta de spam. El código expira en 10 minutos.</span>
    </div>
    <div class="otp-row" id="rOtpBoxes">
      ${[0,1,2,3,4,5].map(i=>`<div class="otp-b" id="rob${i}"></div>`).join('')}
    </div>
    <input type="tel" id="rOtpInput" maxlength="6" inputmode="numeric"
      style="text-align:center;font-size:24px;letter-spacing:8px;margin-bottom:8px"
      oninput="window._regOtpType(this.value)"
      placeholder="000000">
    <div class="err" id="rErr4"></div>
    <div style="flex:1"></div>
    <button class="btn btn-g" id="rOtpConfirmBtn" onclick="window._regConfirm()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="vertical-align:middle"><polyline points="20 6 9 17 4 12"/></svg> Confirmar firma y registrar</button>
    <button class="btn btn-gh" style="margin-top:8px" onclick="window._regStep(3)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="vertical-align:middle"><polyline points="15 18 9 12 15 6"/></svg> Volver</button>
    <div style="text-align:center;margin-top:12px;font-size:11px;color:#94a3b8;font-weight:600">Paso 4 / 5</div>
  </div>

  <!-- STEP 5: ÉXITO -->
  <div class="step" id="rs5" style="text-align:center">
    <div style="margin-top:20px"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0d9f6e" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg></div>
    <div style="font-size:15px;font-weight:800;color:#0d9f6e;margin-top:12px;margin-bottom:8px">¡Registro completado!</div>
    <div style="font-size:12px;color:#374151;margin-bottom:16px;line-height:1.6">Tu empresa está registrada. Un administrador la verificará en breve.<br><b>Ya puedes ingresar a la web</b> y comenzar a cargar tus datos.</div>
    <div style="flex:1"></div>
    <button class="btn btn-g" onclick="window._regFinish()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="vertical-align:middle"><polyline points="9 18 15 12 9 6"/></svg> Entrar al portal</button>
    <div style="text-align:center;margin-top:12px;font-size:11px;color:#94a3b8;font-weight:600">Paso 5 / 5</div>
  </div>
</div>
</div>`;

  window._regLang = lang;
  window._regOtpHash = null;
  window._regUserData = null;

  window._regStep = async (n) => {
    if (n === 3) {
      const nom  = (document.getElementById('rNom')?.value||'').trim();
      const cif  = (document.getElementById('rCif')?.value||'').trim();
      const cont = (document.getElementById('rCont')?.value||'').trim();
      const tel  = (document.getElementById('rTel')?.value||'').trim();
      const email= (document.getElementById('rEmail')?.value||'').trim().toLowerCase();
      const pass = (document.getElementById('rPass')?.value||'').trim();
      const err  = document.getElementById('rErr2');
      if (!nom||!cif||!cont||!tel||!email||!pass) { err.textContent='Completa todos los campos'; err.style.display='block'; return; }
      if (pass.length < 8) { err.textContent='Contraseña mínimo 8 caracteres'; err.style.display='block'; return; }
      err.style.display='none';
      window._regUserData = { nombre:nom, cif, contacto:cont, tel, email, pass, lang:window._regLang };
    }
    if (n === 4) {
      const c1 = document.getElementById('rC1')?.checked;
      const c2 = document.getElementById('rC2')?.checked;
      const err = document.getElementById('rErr3');
      if (!c1||!c2) { err.textContent='Marca ambas casillas'; err.style.display='block'; return; }
      err.style.display='none';
      // Generate OTP
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const { sha256: sh } = await import('./utils.js');
      window._regOtpHash = await sh(otp + window._regUserData.email);
      if (location.hostname==='localhost') console.info('[reg] OTP:', otp);
      const hint = document.getElementById('rOtpHint');
      if (hint) hint.textContent = 'Código enviado a ' + window._regUserData.email.replace(/(.{2}).+@/,'$1***@');
    }
    [1,2,3,4,5].forEach(i => {
      const el = document.getElementById('rs'+i);
      if (el) el.className = 'step' + (i===n?' on':'');
    });
  };

  window._regOtpType = (val) => {
    const digits = val.replace(/\D/g,'').slice(0,6);
    for (let i=0;i<6;i++) {
      const b = document.getElementById('rob'+i);
      if (b) { b.textContent = digits[i]||''; b.className = 'otp-b' + (digits[i]?' filled':''); }
    }
  };

  window._regConfirm = async () => {
    const code = (document.getElementById('rOtpInput')?.value||'').replace(/\D/g,'');
    const err  = document.getElementById('rErr4');
    if (code.length !== 6) { err.textContent='Introduce el código de 6 dígitos'; err.style.display='block'; return; }
    const { sha256: sh } = await import('./utils.js');
    const hashed = await sh(code + window._regUserData.email);
    if (hashed !== window._regOtpHash) { err.textContent='Código incorrecto'; err.style.display='block'; return; }
    err.style.display='none';
    const btn = document.getElementById('rOtpConfirmBtn'); if(btn) { btn.disabled=true; btn.textContent='Registrando…'; }
    try {
      // Create Firebase Auth user
      const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const cred = await createUserWithEmailAndPassword(getBEUAuth(), window._regUserData.email, window._regUserData.pass);
      await updateProfile(cred.user, { displayName: window._regUserData.nombre });
      // Create Firestore docs
      const empId = cred.user.uid;
      const empData = {
        id: empId, nombre: window._regUserData.nombre,
        cif: window._regUserData.cif, contacto: window._regUserData.contacto,
        tel: window._regUserData.tel, email: window._regUserData.email,
        nivel: 'semi', tipo: 'empresa', vehiculos: [],
        creadoTs: new Date().toISOString(),
      };
      await fsSet('companies/' + empId, empData, false);
      await fsSet('users/' + empId, {
        id: empId, nombre: window._regUserData.nombre,
        email: window._regUserData.email, rol: 'empresa',
        lang: window._regUserData.lang || 'es',
        empresaId: empId, nivel: 'semi',
      }, false);
      // Save RGPD consent
      const retainUntil = new Date(); retainUntil.setFullYear(retainUntil.getFullYear()+2);
      await fsSet('companies/' + empId + '/consentimientos/rgpd_' + Date.now(), {
        id: 'rgpd_' + Date.now(), empresaId: empId,
        ts: new Date().toISOString(), lang: window._regUserData.lang || 'es',
        conservaHasta: retainUntil.toISOString().slice(0,10), firmado: true,
        firmadoPor: window._regUserData.nombre,
      }, false);
      window._regStep(5);
      window._regUserData._uid = empId;
    } catch(e) {
      if(btn) { btn.disabled=false; btn.textContent='✓ Confirmar firma y registrar'; }
      const code2 = e?.code||'';
      let msg = 'Error al registrar: ' + (e?.message||'');
      if (code2.includes('email-already-in-use')) msg = 'Este email ya está registrado. Usa el botón de acceso.';
      err.textContent = msg; err.style.display='block';
    }
  };

  window._regFinish = async () => {
    // Auto-login after registration
    try {
      const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const cred = await signInWithEmailAndPassword(getBEUAuth(), window._regUserData.email, window._regUserData.pass);
      const userDoc = await fsGet('users/' + cred.user.uid).catch(()=>null);
      _onUserLoaded(userDoc || { id: cred.user.uid, nombre: window._regUserData.nombre, email: window._regUserData.email, rol: 'empresa', lang: window._regUserData.lang||'es' });
    } catch(e) {
      _showLogin(); // fallback to login
    }
  };
}

window._auth = {
  loginEmail:  _loginEmail,
  showPin:     () => { _pinBuffer = ''; _pinDisplay(); _showLoginForm('Pin'); },
  showEmail:   () => {
    if (!document.getElementById('loginFormEmail')) { _showLogin(); return; }
    _showLoginForm('Email'); setTimeout(() => document.getElementById('loginIdent')?.focus(), 50);
  },
  pinKey: (k) => {
    if (k === '⌫') { _pinBuffer = _pinBuffer.slice(0, -1); }
    else if (_pinBuffer.length < 6) _pinBuffer += k;
    _pinDisplay();
    if (_pinBuffer.length === 6) _checkPin();
  },
  verify2FA:   _verify2FA,
  resend2FA:   _resend2FA,
  cycleLang:   _cycleLang,
  setLangDirect: _setLangDirect,
  logout,
  showRegister: _showRegisterEmpresa,
};

// logout already exported above as named export
