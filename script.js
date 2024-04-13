const elements = Object.freeze({
  /* Backstage elemetns */
  settings: $('#settings-panel'),
  darkModeCheckbutton: $('#checkbox-dark-mode'),
  darkModers: $('*:not(img, video, iframe, head, head *)'),
  panels: $('.body-frame'),
  returnButtons: $('.button-return'),
  inputs: $('.input-text'),
  /* Main panels */
  login: $('#login'),
  signup: $('#signup'),
  signupConfirm: $('#signup-confirm'),
  resetEmail: $('#reset-email'),
  resetNew: $('#reset-new'),
  textRecognition: $('#text-recognition')
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
  langCodes: {"aa":"Afar","ab":"Abkhazian","ae":"Avestan","af":"Afrikaans","ak":"Akan","am":"Amharic","an":"Aragonese","ar":"Arabic","as":"Assamese","av":"Avaric","ay":"Aymara","az":"Azerbaijani","ba":"Bashkir","be":"Belarusian","bg":"Bulgarian","bh":"Bihari languages","bi":"Bislama","bm":"Bambara","bn":"Bengali","bo":"Tibetan","br":"Breton","bs":"Bosnian","ca":"Catalan","ce":"Chechen","ch":"Chamorro","co":"Corsican","cr":"Cree","cs":"Czech","cu":"Church Slavic","cv":"Chuvash","cy":"Welsh","da":"Danish","de":"German","dv":"Maldivian","dz":"Dzongkha","ee":"Ewe","el":"Greek","en":"English","eo":"Esperanto","es":"Spanish","et":"Estonian","eu":"Basque","fa":"Persian","ff":"Fulah","fi":"Finnish","fj":"Fijian","fo":"Faroese","fr":"French","fy":"Western Frisian","ga":"Irish","gd":"Gaelic","gl":"Galician","gn":"Guarani","gu":"Gujarati","gv":"Manx","ha":"Hausa","he":"Hebrew","hi":"Hindi","ho":"Hiri Motu","hr":"Croatian","ht":"Haitian","hu":"Hungarian","hy":"Armenian","hz":"Herero","ia":"Interlingua","id":"Indonesian","ie":"Interlingue","ig":"Igbo","ii":"Sichuan Yi","ik":"Inupiaq","io":"Ido","is":"Icelandic","it":"Italian","iu":"Inuktitut","ja":"Japanese","jv":"Javanese","ka":"Georgian","kg":"Kongo","ki":"Kikuyu","kj":"Kuanyama","kk":"Kazakh","kl":"Kalaallisut","km":"Central Khmer","kn":"Kannada","ko":"Korean","kr":"Kanuri","ks":"Kashmiri","ku":"Kurdish","kv":"Komi","kw":"Cornish","ky":"Kirghiz","la":"Latin","lb":"Luxembourgish","lg":"Ganda","li":"Limburgan","ln":"Lingala","lo":"Lao","lt":"Lithuanian","lu":"Luba-Katanga","lv":"Latvian","mg":"Malagasy","mh":"Marshallese","mi":"Maori","mk":"Macedonian","ml":"Malayalam","mn":"Mongolian","mr":"Marathi","ms":"Malay","mt":"Maltese","my":"Burmese","na":"Nauru","nb":"Norwegian","nd":"North Ndebele","ne":"Nepali","ng":"Ndonga","nl":"Dutch","nn":"Norwegian","no":"Norwegian","nr":"South Ndebele","nv":"Navajo","ny":"Chichewa","oc":"Occitan","oj":"Ojibwa","om":"Oromo","or":"Oriya","os":"Ossetic","pa":"Panjabi","pi":"Pali","pl":"Polish","ps":"Pushto","pt":"Portuguese","qu":"Quechua","rm":"Romansh","rn":"Rundi","ro":"Romanian","ru":"Russian","rw":"Kinyarwanda","sa":"Sanskrit","sc":"Sardinian","sd":"Sindhi","se":"Northern Sami","sg":"Sango","si":"Sinhala","sk":"Slovak","sl":"Slovenian","sm":"Samoan","sn":"Shona","so":"Somali","sq":"Albanian","sr":"Serbian","ss":"Swati","st":"Sotho, Southern","su":"Sundanese","sv":"Swedish","sw":"Swahili","ta":"Tamil","te":"Telugu","tg":"Tajik","th":"Thai","ti":"Tigrinya","tk":"Turkmen","tl":"Tagalog","tn":"Tswana","to":"Tonga","tr":"Turkish","ts":"Tsonga","tt":"Tatar","tw":"Twi","ty":"Tahitian","ug":"Uighur","uk":"Ukrainian","ur":"Urdu","uz":"Uzbek","ve":"Venda","vi":"Vietnamese","vo":"Volapük","wa":"Walloon","wo":"Wolof","xh":"Xhosa","yi":"Yiddish","yo":"Yoruba","za":"Zhuang","zh":"Chinese","zu":"Zulu"},
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
  userEmail: null,
  tokens: { 
    access: null,
    refresh: null
    },
  base64Data: null,
  texts: {
    recognised: '',
    translated: ''
    }
  });

/* Utlility functions */
const checkNullOrUndefined = (...args) => args.some(param => Object.is(param, null) || Object.is(param, undefined));

const show = (element = null) => {
  elements.panels.addClass('hidden');
  element.removeClass('hidden');
  elements.inputs.val('');
  }

const logout = () => {
  localStorage.clear();
  [variables.userEmail, variables.tokens.access, variables.tokens.refresh, variables.base64Data] = Array.from({length: 4}).map(e => null);
  [variables.texts.recognised, variables.texts.translated] = Array.from({length: 2}).map(e => '');
  }

const setColourScheme = () => elements.darkModeCheckbutton.is(':checked') ?
  elements.darkModers.addClass('dark-mode') :
  elements.darkModers.removeClass('dark-mode');

async function readFromClipboard() {
  try {
    for (const item of await navigator.clipboard.read()) {
      if (!item.types.includes('image/png'))
        throw new Error('Clipboard does not contain PNG image data.');

      const blob = await item.getType('image/png');

      elements.textRecognition.find('#tr-preview').attr('src', URL.createObjectURL(blob));

      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        variables.base64Data = reader.result.split(',')[1];
        })
      reader.readAsDataURL(blob);
      }
    }
  catch (error) {
    console.error(error);
    }
  }

const writeToClipboard = text => {
  navigator.clipboard.writeText(text);
  }
/* ----- */

/* Requests */
const loginRequest = () => {
  const [login, password, persist] = [
    elements.login.find('#l-login').val(),
    elements.login.find('#l-password').val(),
    elements.login.find('#l-remember').prop('checked')
    ];

  $.ajax({
    url: urls.login,
    data: JSON.stringify({login, password})
    })
    .done((data) => {
      [variables.tokens.access, variables.tokens.refresh] = [data['access_token'], data['refresh_token']];
      if (persist) {
        localStorage.setItem('access_token', variables.tokens.access);
        localStorage.setItem('refresh_token', variables.tokens.refresh);
        }
      
      show(elements.textRecognition);
      })
    .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
  }

const signupRequest = () => {
  const [email, login, password, repeat] = [
    elements.signup.find('#s-email').val(),
    elements.signup.find('#s-login').val(),
    elements.signup.find('#s-password').val(),
    elements.signup.find('#s-password-repeat').val()
    ];
  
  if (password === repeat)
    $.ajax({
      url: urls.signup,
      data: JSON.stringify({email, login, password})
      })
      .done((data) => {
        variables.userEmail = email;
        show(elements.signupConfirm);
        })
      .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
    else
      console.error('Passwords do not match');
  }

const confirmRequest = () => {
  const [email, verification_code] = [
    variables.userEmail,
    Number.parseInt(elements.signupConfirm.find('#sc-code').val())
    ];

  $.ajax({
    url: urls.confirm,
    data: JSON.stringify({email, verification_code})
    })
    .done((data) => {
      variables.userEmail = null;
      show(elements.login);
      })
    .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
  }

const resendCodeRequest = () => {
  const email = variables.userEmail ?? elements.resetEmail.find('#re-email').val();

  $.ajax({
    url: urls.resendCode,
    data: JSON.stringify({email})
    })
    .done((data) => {
      variables.userEmail = email;
      show(elements.resetNew);
      })
    .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
  }

const newPasswordRequest = () => {
  const [email, code, password, repeat] = [
    variables.userEmail,
    Number.parseInt(elements.resetNew.find('#rn-code').val()),
    elements.resetNew.find('#rn-password').val(),
    elements.resetNew.find('#rn-password-repeat').val()
    ];

  if (password === repeat)
    $.ajax({
      url: urls.resetPassword,
      data: JSON.stringify({email, code, password})
      })
      .done((data) => {
        variables.userEmail = null;
        show(elements.login);
        })
      .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
    else
      console.error('Passwords do not match'); 
  }

const refreshRequest = () => {
  const [access_token, refresh_token] = [
    variables.tokens.access,
    variables.tokens.refresh
    ];

  let successful = false;

  $.ajax({
    url: urls.refresh,
    data: JSON.stringify({access_token, refresh_token})
    })
    .done((data) => {
      successful = true;
      })
    .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));

  return successful;
  }

const recognizeAndTranslateRequest = () => {
  const [access_token, base64Data, target_language] = [
    variables.tokens.access,
    variables.base64Data,
    elements.textRecognition.find('#tr-languages').val()
    ];
  
  $.ajax({
    url: urls.recognize,
    data: JSON.stringify({access_token, base64Data, target_language})
    })
    .done((data) => {
      [variables.texts.recognised, variables.texts.translated] = [data['recognized_text'], data['translated_text']];
      })
    .fail((jqXHR) => {
      console.error(JSON.parse(jqXHR.responseText), jqXHR.status);
      if (!refreshRequest() && checkNullOrUndefined(localStorage.getItem('access_token'), localStorage.getItem('refresh_token'))) {
        logout();
        show(elements.login);
        }
      else
        recognizeAndTranslateRequest();
      });
  }
/* ----- */

const load = () => {
  /* Prepare AJAX for all requests */ 
  $.ajaxSetup({
    type: variables.template.methods.post,
    dataType: variables.template.dataType,
    headers: variables.template.header
    });

  /* Setup request buttons */
  elements.login.find('#l-sign-in').on('click', loginRequest);
  elements.signup.find('#s-sign-up').on('click', signupRequest);
  elements.signupConfirm.find('#sc-continue').on('click', confirmRequest);
  elements.signupConfirm.find('#sc-resend').on('click', resendCodeRequest);
  elements.resetEmail.find('#re-send').on('click', resendCodeRequest);
  elements.resetNew.find('#rn-resend').on('click', resendCodeRequest);
  elements.resetNew.find('#rn-continue').on('click', newPasswordRequest);
  elements.textRecognition.find('#tr-send').on('click', recognizeAndTranslateRequest);

  /* Setup copy buttons */
  elements.textRecognition.find('#tr-copy').on('click', readFromClipboard);
  elements.textRecognition.find('#tr-recognised-copy').on('click', () => writeToClipboard(variables.texts.recognised));
  elements.textRecognition.find('#tr-translated-copy').on('click', () => writeToClipboard(variables.texts.translated))

  /* Setup access buttons */
  elements.returnButtons.on('click', () => show(elements.login));
  elements.textRecognition.find('#tr-logout').on('click', () => logout);
  elements.login.find('#l-sign-up').on('click', () => show(elements.signup));
  elements.login.find('#l-reset-password').on('click', () => show(elements.resetEmail));

  /* Populate select with languages */
  let tmp = elements.textRecognition.find('#tr-languages');
  for (let [code, name] of Object.entries(variables.langCodes))
    tmp.append($('<option>')
      .attr('value', code)
      .text(name)
      );

  /* Set initial colour scheme */
  if (window.matchMedia('(prefers-color-scheme: dark)').matches ?? false) {
    elements.darkModeCheckbutton.prop('checked', true);
    setColourScheme();
    }

  /* Setup dark mode checkbox */
  elements.darkModeCheckbutton.on('change', setColourScheme);

  /* Show interface */
  if (checkNullOrUndefined(localStorage.getItem('access_token'), localStorage.getItem('refresh_token'))) {
    logout();
    show(elements.login);
    }
  else {
    [variables.tokens.access, variables.tokens.refresh] = [localStorage.getItem('access_token'), localStorage.getItem('refresh_token')];
    show(elements.textRecognition);
    }
  }
/* Load page */
$(document).ready(load);