const elements = Object.freeze({
  login: $('#login'),
  signup: $('#signup'),
  signupConfirm: $('#signup-confirm'),
  resetEmail: $('#reset-email'),
  resetNew: $('#reset-new'),
  textRecognition: $('#text-recognition')
  });

const urls =  Object.freeze({
  api: 'http://localhost:8080/api',
  get login() { return `${this.api}/login`; },
  get signup() { return `${this.api}/signup`; },
  get confirm() { return `${this.api}/confirm`; },
  get resendCode() { return `${this.api}/resendCode`; },
  get resetPassword() { return `${this.api}/resetPassword`; },
  get refresh() { return `${this.api}/refresh`; },
  get recognize() { return `${this.api}/recognize`; }
  });

const variables = Object.seal({
  reader: new FileReader(),
  headerTemplate: {
    'Content-Type': 'application/json'
    // ,'Access-Control-Allow-Credentials': true
    },
  userEmailConfirm: null,
  userEmailReset: null,
  accessToken: null,
  refreshToken: null
  });

const show = (element = null) => {
  $('.body-frame').addClass('hidden');
  element.removeClass('hidden');
  $('.input-text').val('');
  }

async function readImageFromClipboard() {
  try {
    for (let item of await navigator.clipboard.read()) 
      if (item.types.includes('image/png')) 
        return await item.getType('image/png');
    return null;
    }
  catch (err) {
    console.error('Failed to read clipboard contents: ', err);
    }
  }

const saveToClipboard = element => {
  navigator.clipboard.writeText(element.text());
  }

const loginUser = () => {
  const [login, password] = [
    elements.login.find('#l-login').val(),
    elements.login.find('#l-password').val()
    ];
    
  
  $.ajax({
    url: urls.login,
    type: 'POST',
    dataType: 'json',
    headers: variables.headerTemplate,
    data: JSON.stringify({login, password})
    })
    .done((data, textStatus, jqXHR) => {
      console.log(jqXHR);
      show(elements.textRecognition);
      })
    .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
  }

const signup = () => {
  const [email, login, password, repeat] = [
    elements.signup.find('#s-email').val(),
    elements.signup.find('#s-login').val(),
    elements.signup.find('#s-password').val(),
    elements.signup.find('#s-password-repeat').val()
    ];
  
  if (password === repeat)
    $.ajax({
      url: urls.signup,
      type: 'POST',
      dataType: 'json',
      headers: variables.headerTemplate,
      data: JSON.stringify({email, login, password})
      })
      .done((data) => {
        variables.userEmailConfirm = email;
        show(elements.signupConfirm);
        })
      .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
    else
      console.error('Passwords do not match');
  }

const confirm = () => {
  const [email, vcode] = [
    variables.userEmailConfirm,
    Number.parseInt(elements.signupConfirm.find('#sc-code').val())
    ];

  $.ajax({
    url: urls.confirm,
    type: 'POST',
    dataType: 'json',
    headers: variables.headerTemplate,
    data: JSON.stringify({email, vcode})
    })
    .done((data) => {
      variables.userEmailConfirm = null;
      show(elements.login);
      })
    .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
  }

const resendCode = () => {
  const email = elements.resetEmail.find('#re-email').val();

  $.ajax({
    url: urls.resendCode,
    type: 'POST',
    dataType: 'json',
    headers: variables.headerTemplate,
    data: JSON.stringify({email})
    })
    .done((data) => {
      variables.userEmailReset = email;
      show(elements.resetNew);
      })
    .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
  }

const newPassword = () => {
  let [email, code, password, repeat] = [
    variables.userEmailReset,
    Number.parseInt(elements.resetNew.find('#rn-code').val()),
    elements.resetNew.find('#rn-password').val(),
    elements.resetNew.find('#rn-password-repeat').val()
    ];

  if (password === repeat)
    $.ajax({
      url: urls.resetPassword,
      type: 'POST',
      dataType: 'json',
      headers: variables.headerTemplate,
      data: JSON.stringify({email, code, password})
      })
      .done((data) => {
        variables.userEmailReset = null;
        show(elements.login);
        })
      .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
    else
      console.error('Passwords do not match'); 
  }

const recognizeAndTranslate = () => {
  let [accessToken, targetLanguage] = [
    variables.accessToken,
    null /* brak !!!! */
    ];
  let base64Data = null /* brak !!!!! */;

  $.ajax({
    url: urls.recognize,
    type: 'POST',
    dataType: 'json',
    headers: variables.headerTemplate,
    data: JSON.stringify({accessToken, base64Data, targetLanguage})
    })
    .done((data) => {
      console.log(data);
      })
    .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
  }

const load = () => {
  show(elements.login);

  elements.login.find('#l-sign-in').on('click', loginUser);
  elements.signup.find('#s-sign-up').on('click', signup);
  elements.signupConfirm.find('#sc-continue').on('click', confirm);
  elements.resetEmail.find('#re-send').on('click', resendCode);
  elements.resetNew.find('#rn-continue').on('click', newPassword);
  elements.textRecognition.find('#tr-send').on('click', recognizeAndTranslate);

  elements.textRecognition.find('#tr-recognised-copy').on('click', () => 
    saveToClipboard(elements.textRecognition.find('#tr-recognised pre').text())
    );
  elements.textRecognition.find('#tr-translated-copy').on('click', () => 
    saveToClipboard(elements.textRecognition.find('#tr-translated pre').text())
    );

  $('.button-return').on('click', () => show(elements.login));
  elements.login.find('#l-sign-up').on('click', () => show(elements.signup));
  elements.login.find('#l-reset-password').on('click', () => show(elements.resetEmail));

  }
$(document).ready(load);