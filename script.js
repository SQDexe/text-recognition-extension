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
  get refresh() { return `${this.api}/refresh`; },
  get resendCode() { return `${this.api}/resendCode`; },
  get resetPassword() { return `${this.api}/resetPassword`; },
  get recognize() { return `${this.api}/recognize`; }
  });

const variables = Object.seal({
  reader: new FileReader(),
  headerTemplate: new Headers({'Content-Type': 'application/json'}),
  userEmail: null,
  accessToken: null,
  refreshToken: null
  });

const show = (element = null) => {
  $('.body-frame').addClass('hidden');
  element.removeClass('hidden');
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

const login = () => {
  let [login, password] = [
    elements.login.find('#l-login').val(),
    elements.login.find('#l-password').val()
    ];
  
  $.ajax({
    url: urls.login,
    type: 'post',
    dataType: 'json',
    headers: variables.headerTemplate,
    data: JSON.stringify({login, password})
    })
    .done((data, textStatus, jqXHR) => {
      show(elements.textRecognition);
      })
    .fail((jqXHR, textStatus, errorThrown) => console.error(jqXHR));
  }

const signup = () => {
  let [email, login, password, repeat] = [
    elements.login.find('#s-email').val(),
    elements.login.find('#s-login').val(),
    elements.login.find('#s-password').val(),
    elements.login.find('#s-password-repeat').val()
    ];
  
  if (password === repeat)
    $.ajax({
      url: urls.signup,
      type: 'post',
      dataType: 'json',
      headers: variables.headerTemplate,
      data: JSON.stringify({email, login, password})
      })
      .done((data, textStatus, jqXHR) => {
        variables.userEmail = email;
        show(elements.signupConfirm);
        })
      .fail((jqXHR, textStatus, errorThrown) => console.error(jqXHR));
    else
      console.error('Passwords do not match');
  }

const confirm = () => {
  let [email, vcode] = [
    variables.userEmail,
    Number.parseInt(elements.login.find('#sc-token').val())
    ];

  $.ajax({
    url: urls.confirm,
    type: 'post',
    dataType: 'json',
    headers: variables.headerTemplate,
    data: JSON.stringify({email, vcode})
    })
    .done((data, textStatus, jqXHR) => {
      show(elements.login);
      })
    .fail((jqXHR, textStatus, errorThrown) => console.error(jqXHR));
  }

const newPassword = () => {
  let [email, vcode, password, repeat] = [
    variables.userEmail,
    Number.parseInt(elements.login.find('#rn-token').val()),
    elements.resetNew.find('#rn-password').val(),
    elements.resetNew.find('#rn-password-repeat').val()
    ];
  if (password === repeat)
    $.ajax({
      url: urls.resetPassword,
      type: 'post',
      dataType: 'json',
      headers: variables.headerTemplate,
      data: JSON.stringify({email, vcode})
      })
      .done((data, textStatus, jqXHR) => {
        show(elements.login);
        })
      .fail((jqXHR, textStatus, errorThrown) => console.error(jqXHR));
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
    type: 'post',
    dataType: 'json',
    headers: variables.headerTemplate,
    data: JSON.stringify({accessToken, base64Data, targetLanguage})
    })
    .done((data, textStatus, jqXHR) => {
      console.log(data);
      })
    .fail((jqXHR, textStatus, errorThrown) => console.error(jqXHR));
  }

const load = () => {
  show(elements.login);

  elements.login.find('#l-sign-in').on('click', login);
  elements.signup.find('#s-sign-up').on('click', signup);
  elements.signupConfirm.find('#sc-continue').on('click', confirm);
  elements.resetNew.find('#sc-continue').on('click', newPassword);
  elements.textRecognition.find('#tr-send').on('click', recognizeAndTranslate);

  elements.textRecognition.find('#tr-recognised-copy').on('click', () => 
    saveToClipboard(elements.textRecognition.find('#tr-recognised pre').text())
    );
  elements.textRecognition.find('#tr-translated-copy').on('click', () => 
    saveToClipboard(elements.textRecognition.find('#tr-translated pre').text())
    );

  $('.button-return').on('click', () => { show(elements.login); });
  elements.login.find('#l-sign-up').on('click', () => { show(elements.signup); });
  elements.login.find('#l-reset-password').on('click', () => { show(elements.resetEmail); });

  }
$(document).ready(load);