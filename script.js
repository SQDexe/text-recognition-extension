'use strict';

const elements = Object.freeze({
  /* Backstage elemetns */
  settings: $('#settings-panel'),
  darkModeCheckbutton: $('#checkbox-dark-mode'),
  darkModers: $('*:not(img, video, iframe, .sign, head, head *)'),
  bodyPanels: $('.body-frame'),
  dialogsFrames: $('.dialog-frame'),
  returnButtons: $('.button-return'),
  dialogReturnButtons: $('.button-dialog-return'),
  textInputs: $('.input-text:not(#settings-panel .input-text)'),
  checkInputs: $('.input-checkbox:not(#settings-panel .input-checkbox)'),
  blur: $('#blur-panel'),
  /* Main panels */
  panels: {
    login: $('#login'),
    signup: $('#signup'),
    signupConfirm: $('#signup-confirm'),
    resetEmail: $('#reset-email'),
    resetNew: $('#reset-new'),
    textRecognition: $('#text-recognition')
    },
  /* Dialogs */
  dialogs: {
    success: $('#notify-succes'),
    warning: $('#notify-warning'),
    error: $('#notify-error')
    }
  });

/* API's urls */
const urls =  Object.freeze({
  api: 'https://recognitiondeployment-production.up.railway.app/api',
  get login() { return `${this.api}/login`; },
  get signup() { return `${this.api}/signup`; },
  get confirm() { return `${this.api}/confirm`; },
  get resendCode() { return `${this.api}/resendCode`; },
  get resetPassword() { return `${this.api}/resetPassword`; },
  get refresh() { return `${this.api}/refresh`; },
  get recognize() { return `${this.api}/recognize`; }
  });

/* Variables for project managment */
const variables = Object.seal({
  storageKey: 'text-recognition',
  langCodes: {'aa':'Afar','ab':'Abkhazian','ae':'Avestan','af':'Afrikaans','ak':'Akan','am':'Amharic','an':'Aragonese','ar':'Arabic','as':'Assamese','av':'Avaric','ay':'Aymara','az':'Azerbaijani','ba':'Bashkir','be':'Belarusian','bg':'Bulgarian','bh':'Bihari languages','bi':'Bislama','bm':'Bambara','bn':'Bengali','bo':'Tibetan','br':'Breton','bs':'Bosnian','ca':'Catalan','ce':'Chechen','ch':'Chamorro','co':'Corsican','cr':'Cree','cs':'Czech','cu':'Church Slavic','cv':'Chuvash','cy':'Welsh','da':'Danish','de':'German','dv':'Maldivian','dz':'Dzongkha','ee':'Ewe','el':'Greek','en':'English','eo':'Esperanto','es':'Spanish','et':'Estonian','eu':'Basque','fa':'Persian','ff':'Fulah','fi':'Finnish','fj':'Fijian','fo':'Faroese','fr':'French','fy':'Western Frisian','ga':'Irish','gd':'Gaelic','gl':'Galician','gn':'Guarani','gu':'Gujarati','gv':'Manx','ha':'Hausa','he':'Hebrew','hi':'Hindi','ho':'Hiri Motu','hr':'Croatian','ht':'Haitian','hu':'Hungarian','hy':'Armenian','hz':'Herero','ia':'Interlingua','id':'Indonesian','ie':'Interlingue','ig':'Igbo','ii':'Sichuan Yi','ik':'Inupiaq','io':'Ido','is':'Icelandic','it':'Italian','iu':'Inuktitut','ja':'Japanese','jv':'Javanese','ka':'Georgian','kg':'Kongo','ki':'Kikuyu','kj':'Kuanyama','kk':'Kazakh','kl':'Kalaallisut','km':'Central Khmer','kn':'Kannada','ko':'Korean','kr':'Kanuri','ks':'Kashmiri','ku':'Kurdish','kv':'Komi','kw':'Cornish','ky':'Kirghiz','la':'Latin','lb':'Luxembourgish','lg':'Ganda','li':'Limburgan','ln':'Lingala','lo':'Lao','lt':'Lithuanian','lu':'Luba-Katanga','lv':'Latvian','mg':'Malagasy','mh':'Marshallese','mi':'Maori','mk':'Macedonian','ml':'Malayalam','mn':'Mongolian','mr':'Marathi','ms':'Malay','mt':'Maltese','my':'Burmese','na':'Nauru','nb':'Norwegian','nd':'North Ndebele','ne':'Nepali','ng':'Ndonga','nl':'Dutch','nn':'Norwegian','no':'Norwegian','nr':'South Ndebele','nv':'Navajo','ny':'Chichewa','oc':'Occitan','oj':'Ojibwa','om':'Oromo','or':'Oriya','os':'Ossetic','pa':'Panjabi','pi':'Pali','pl':'Polish','ps':'Pushto','pt':'Portuguese','qu':'Quechua','rm':'Romansh','rn':'Rundi','ro':'Romanian','ru':'Russian','rw':'Kinyarwanda','sa':'Sanskrit','sc':'Sardinian','sd':'Sindhi','se':'Northern Sami','sg':'Sango','si':'Sinhala','sk':'Slovak','sl':'Slovenian','sm':'Samoan','sn':'Shona','so':'Somali','sq':'Albanian','sr':'Serbian','ss':'Swati','st':'Sotho, Southern','su':'Sundanese','sv':'Swedish','sw':'Swahili','ta':'Tamil','te':'Telugu','tg':'Tajik','th':'Thai','ti':'Tigrinya','tk':'Turkmen','tl':'Tagalog','tn':'Tswana','to':'Tonga','tr':'Turkish','ts':'Tsonga','tt':'Tatar','tw':'Twi','ty':'Tahitian','ug':'Uighur','uk':'Ukrainian','ur':'Urdu','uz':'Uzbek','ve':'Venda','vi':'Vietnamese','vo':'Volapük','wa':'Walloon','wo':'Wolof','xh':'Xhosa','yi':'Yiddish','yo':'Yoruba','za':'Zhuang','zh':'Chinese','zu':'Zulu'},
  template: {
    methods: {
      post: 'POST',
      patch: 'PATCH'
      },
    header: {
      'Content-Type': 'application/json'
      },
    dataType: 'json' 
    },
  data: {
    email: null,
    persist: false,
    base64: null
    },
  tokens: { 
    access: null,
    refresh: null
    },
  texts: {
    recognised: '',
    translated: ''
    }
  });

/* Utlility functions */
const not = bool => !bool;

const checkNullOrUndefined = (...args) => args.some(param => Object.is(param, null) || Object.is(param, undefined));

const online = () => navigator.onLine;

function hide(elementQuery) {
  elementQuery.addClass('hidden');
  }

function unhide(elementQuery) {
  elementQuery.removeClass('hidden');
  }
/* ----- */


/* Storage functions */
function packStorage() {
  localStorage.setItem(variables.storageKey, JSON.stringify({
    'access_token': variables.tokens.access,
    'refresh_token': variables.tokens.refresh,
    'base64': variables.data.base64,
    'recognised_text': variables.texts.recognised,
    'translated_text': variables.texts.translated
    }));
  }

function unpackStorage() {
  const storage = JSON.parse(localStorage.getItem(variables.storageKey));
  variables.tokens.access = storage['access_token'] ?? null;
  variables.tokens.refresh = storage['refresh_token'] ?? null;
  variables.data.base64 = storage['base64'] ?? null;
  variables.texts.recognised = storage['recognised_text'] ?? '';
  variables.texts.translated = storage['translated_text'] ?? '';
  }

function getStorage() {
  return localStorage.getItem(variables.storageKey);
  }
/* ----- */

/* Element content and visibility operating functions */
function show(element) {
  hide(elements.bodyPanels);
  elements.textInputs.val('');
  elements.checkInputs.prop('checked', false);
  unhide(element);
  }

function showDialog(element, texts = {}) {
  unhide(elements.blur);
  element.find('.success-text').text(texts.succes ?? '');
  element.find('.error-text').text(texts.error ?? '');
  unhide(element);
  }

function hideDialogs() {
  hide(elements.dialogsFrames);
  hide(elements.blur);
  }

function setErrorMessage(...args) {
  const list = $('<ul>');
  args.forEach(e => list.append($('<li>').text(e)));
  elements.dialogs.error.find('.dialog-description').html(list);
  }

function setColourScheme() {
  elements.darkModeCheckbutton.is(':checked') ?
    elements.darkModers.addClass('dark-mode') :
    elements.darkModers.removeClass('dark-mode');
  }

function setPreview() {
  elements.panels.textRecognition.find('#tr-preview').attr('src', variables.data.base64);
  }
/* ----- */

/* Clipboard functions */
async function readFromClipboard() {
  try {
    for (const item of await navigator.clipboard.read()) {
      if (not(item.types.includes('image/png')))
        throw new Error('Clipboard does not contain PNG image data.');

      const blob = await item.getType('image/png');

      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        variables.data.base64 = reader.result;
        setPreview();
        })
      reader.readAsDataURL(blob);
      }
    }
  catch (error) {
    console.error(error);

    setErrorMessage('Can not copy from clipboard');
    showDialog(elements.dialogs.error);
    }
  }

function writeToClipboard(text) {
  navigator.clipboard.writeText(text);
  }
/* ----- */

/* Clearing functions */
function logout() {
  localStorage.clear();
  [variables.data.email, variables.tokens.access, variables.tokens.refresh, variables.data.base64] = Array.from({length: 4}).map(e => null);
  [variables.texts.recognised, variables.texts.translated] = Array.from({length: 2}).map(e => '');
  variables.data.persist = false;
  }
/* ----- */

/* Requests */
const requests = Object.freeze({
  login: function() {
    const [login, password, persist] = [
      elements.panels.login.find('#l-login').val(),
      elements.panels.login.find('#l-password').val(),
      elements.panels.login.find('#l-remember').prop('checked')
      ];

    if (not(online())) {
      showDialog(elements.dialogs.warning);
      return;
      }
      

    $.ajax({
      url: urls.login,
      data: JSON.stringify({login, password})
      })
      .done(data => {

        [variables.tokens.access, variables.tokens.refresh] = [data['access_token'], data['refresh_token']];

        if (persist) {
          variables.data.persist = true;
          packStorage();
          }
        
        show(elements.panels.textRecognition);

        })
      .fail(jqXHR => {

        console.error(jqXHR);
        const [response, status] = [JSON.parse(jqXHR.responseText), jqXHR.status];

        if (status == 404) 
          setErrorMessage(...Object.values(response.errors));
        else
          setErrorMessage('Unkown error');

        showDialog(elements.dialogs.error);

        });
    },
  signup: function() {
    const [email, login, password, repeat] = [
      elements.panels.signup.find('#s-email').val(),
      elements.panels.signup.find('#s-login').val(),
      elements.panels.signup.find('#s-password').val(),
      elements.panels.signup.find('#s-password-repeat').val()
      ];

    if (not(online())) {
      showDialog(elements.dialogs.warning);
      return;
      }
    
    if (not(password === repeat)){
      setErrorMessage('Passwords do not match');
      showDialog(elements.dialogs.error);
      return;
      }

    $.ajax({
      url: urls.signup,
      data: JSON.stringify({email, login, password})
      })
      .done(data => {

        variables.data.email = email;
        show(elements.panels.signupConfirm);

        })
      .fail(jqXHR => {

        console.error(jqXHR);
        const [response, status] = [JSON.parse(jqXHR.responseText), jqXHR.status];

        if (status == 404) 
          setErrorMessage(...Object.values(response.errors));
        else
          setErrorMessage('Unkown error');

        showDialog(elements.dialogs.error);

        });
    },
  confirm: function() {
    const [email, verification_code] = [
      variables.data.email,
      Number.parseInt(elements.panels.signupConfirm.find('#sc-code').val())
      ];

    if (not(online())) {
      showDialog(elements.dialogs.warning);
      return;
      }
  
    $.ajax({
      url: urls.confirm,
      data: JSON.stringify({email, verification_code})
      })
      .done(data => {

        variables.data.email = null;
        show(elements.panels.login);

        })
      .fail(jqXHR => {

        console.error(jqXHR);
        const [response, status] = [JSON.parse(jqXHR.responseText), jqXHR.status];

        if (status == 404) 
          setErrorMessage(...Object.values(response.errors));
        else
          setErrorMessage('Unkown error');

        showDialog(elements.dialogs.error);

        });
    },
  resendCode: function() {
    const email = variables.data.email ?? elements.panels.resetEmail.find('#re-email').val();

    if (not(online())) {
      showDialog(elements.dialogs.warning);
      return;
      }
  
    $.ajax({
      url: urls.resendCode,
      data: JSON.stringify({email})
      })
      .done(data => {

        variables.data.email = email;
        show(elements.panels.resetNew);

        })
      .fail(jqXHR => {

        console.error(jqXHR);
        const [response, status] = [JSON.parse(jqXHR.responseText), jqXHR.status];

        if (status == 404) 
          setErrorMessage(...Object.values(response.errors));
        else
          setErrorMessage('Unkown error');

        showDialog(elements.dialogs.error);

        });
    },
  newPassword: function() {
    const [email, code, password, repeat] = [
      variables.data.email,
      Number.parseInt(elements.panels.resetNew.find('#rn-code').val()),
      elements.panels.resetNew.find('#rn-password').val(),
      elements.panels.resetNew.find('#rn-password-repeat').val()
      ];

    if (not(online())) {
      showDialog(elements.dialogs.warning);
      return;
      }
  
    if (not(password === repeat)) {
      setErrorMessage('Passwords do not match');
      showDialog(elements.dialogs.error);
      return;
      }

    $.ajax({
      url: urls.resetPassword,
      data: JSON.stringify({email, code, password})
      })
      .done(data => {

        variables.data.email = null;
        showDialog(elements.dialogs.success);
        show(elements.panels.login);

        })
      .fail(jqXHR => {

        console.error(jqXHR);
        const [response, status] = [JSON.parse(jqXHR.responseText), jqXHR.status];

        if (status == 404) 
          setErrorMessage(...Object.values(response.errors));
        else
          setErrorMessage('Unkown error');

        showDialog(elements.dialogs.error);

        });
    },
  refresh: function() {
    const [access_token, refresh_token] = [
      variables.tokens.access,
      variables.tokens.refresh
      ];
  
    let successful = false;
  
    $.ajax({
      url: urls.refresh,
      data: JSON.stringify({access_token, refresh_token})
      })
      .done(data => {

        [variables.tokens.access, variables.tokens.refresh] = [data['access_token'], data['refresh_token']];

        if (variables.data.persist)
          packStorage();

        successful = true;

        })
      .fail(jqXHR => {

        console.error(jqXHR);

        });
  
    return successful;
    },
  recognizeAndTranslate: function() {
    const [access_token, base64Data, target_language] = [
      variables.tokens.access,
      variables.data.base64.split(',')[1],
      elements.panels.textRecognition.find('#tr-languages').val()
      ];

    if (not(online())) {
      showDialog(elements.dialogs.warning);
      return;
      }
    
    $.ajax({
      url: urls.recognize,
      data: JSON.stringify({access_token, base64Data, target_language})
      })
      .done(data => {

        [variables.texts.recognised, variables.texts.translated] = [data['recognized_text'], data['translated_text']];

        if (variables.data.persist)
          packStorage();

        showDialog(elements.dialogs.success);

        })
      .fail(jqXHR => {
        /* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
        console.error(jqXHR);
        const [response, status] = [JSON.parse(jqXHR.responseText), jqXHR.status];

        if (status == 404) 
          setErrorMessage(...Object.values(response.errors));
        else
          setErrorMessage('Unkown error');

        showDialog(elements.dialogs.error);

        if (not(requests.refresh()) && checkNullOrUndefined(getStorage())) {
          logout();
          setErrorMessage('Timeout, please login again');
          showDialog(elements.dialogs.error);
          show(elements.panels.login);
          return;
          }
        else
          requests.recognizeAndTranslate();
        /* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */

        });
    }
  });
/* ----- */

const load = () => {
  /* Prepare AJAX for all requests */ 
  $.ajaxSetup({
    type: variables.template.methods.post,
    dataType: variables.template.dataType,
    headers: variables.template.header
    });

  /* Setup request buttons */
  elements.panels.login.find('#l-sign-in').on('click', requests.login);
  elements.panels.signup.find('#s-sign-up').on('click', requests.signup);
  elements.panels.signupConfirm.find('#sc-continue').on('click', requests.confirm);
  elements.panels.signupConfirm.find('#sc-resend').on('click', requests.resendCode);
  elements.panels.resetEmail.find('#re-send').on('click', requests.resendCode);
  elements.panels.resetNew.find('#rn-resend').on('click', requests.resendCode);
  elements.panels.resetNew.find('#rn-continue').on('click', requests.newPassword);
  elements.panels.textRecognition.find('#tr-send').on('click', requests.recognizeAndTranslate);

  /* Setup copy buttons */
  elements.panels.textRecognition.find('#tr-copy').on('click', readFromClipboard);
  elements.panels.textRecognition.find('#tr-recognised-copy').on('click', () => writeToClipboard(variables.texts.recognised));
  elements.panels.textRecognition.find('#tr-translated-copy').on('click', () => writeToClipboard(variables.texts.translated));

  /* Setup access buttons */
  elements.returnButtons.on('click', () => show(elements.panels.login));
  elements.dialogReturnButtons.on('click', hideDialogs);
  elements.panels.textRecognition.find('#tr-logout').on('click', () => {
    logout();
    show(elements.panels.login);
    });
  elements.panels.login.find('#l-sign-up').on('click', () => show(elements.panels.signup));
  elements.panels.login.find('#l-reset-password').on('click', () => show(elements.panels.resetEmail));

  /* Populate select with languages */
  let tmp = elements.panels.textRecognition.find('#tr-languages');
  for (let [code, name] of Object.entries(variables.langCodes))
    tmp.append($('<option>')
      .attr('value', code)
      .text(name));

  /* Set initial colour scheme */
  if (window.matchMedia('(prefers-color-scheme: dark)').matches ?? false) {
    elements.darkModeCheckbutton.prop('checked', true);
    setColourScheme();
    }

  /* Setup dark mode checkbox */
  elements.darkModeCheckbutton.on('change', setColourScheme);

  /* Show interface */
  if (checkNullOrUndefined(getStorage())) {
    logout();
    show(elements.panels.login);
    }
  else {
    variables.data.persist = true;
    unpackStorage();
    if (not(checkNullOrUndefined(variables.data.base64)))
      setPreview();
    show(elements.panels.textRecognition);
    }
  }
/* Load page */
$(document).ready(load);