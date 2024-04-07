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
  accessToken: null,
  refreshToken: null,
  base64Data: null
  });

const show = (element = null) => {
  $('.body-frame').addClass('hidden');
  element.removeClass('hidden');
  $('.input-text').val('');
  }

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

const loginUser = () => {
  const [login, password] = [
    elements.login.find('#l-login').val(),
    elements.login.find('#l-password').val()
    ];

  $.ajax({
    url: urls.login,
    type: variables.template.methods.post,
    dataType: variables.template.dataType,
    headers: variables.template.header,
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
      type: variables.template.methods.post,
      dataType: variables.template.dataType,
      headers: variables.template.header,
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

const confirm = () => {
  const [email, vcode] = [
    variables.userEmail,
    Number.parseInt(elements.signupConfirm.find('#sc-code').val())
    ];

  $.ajax({
    url: urls.confirm,
    type: variables.template.methods.post,
    dataType: variables.template.dataType,
    headers: variables.template.header,
    data: JSON.stringify({email, vcode})
    })
    .done((data) => {
      variables.userEmail = null;
      show(elements.login);
      })
    .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
  }

const resendCode = () => {
  const email = variables.userEmail ?? elements.resetEmail.find('#re-email').val();

  $.ajax({
    url: urls.resendCode,
    type: variables.template.methods.post,
    dataType: variables.template.dataType,
    headers: variables.template.header,
    data: JSON.stringify({email})
    })
    .done((data) => {
      variables.userEmail = email;
      show(elements.resetNew);
      })
    .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
  }

const newPassword = () => {
  let [email, code, password, repeat] = [
    variables.userEmail,
    Number.parseInt(elements.resetNew.find('#rn-code').val()),
    elements.resetNew.find('#rn-password').val(),
    elements.resetNew.find('#rn-password-repeat').val()
    ];

  if (password === repeat)
    $.ajax({
      url: urls.resetPassword,
      type: variables.template.methods.post,
      dataType: variables.template.dataType,
      headers: variables.template.header,
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

const recognizeAndTranslate = () => {
  const [accessToken, base64Data, targetLanguage] = [
    variables.accessToken,
    variables.base64Data,
    elements.textRecognition.find('#tr-languages').val()
    ];
  
  $.ajax({
    url: urls.recognize,
    type: variables.template.methods.post,
    dataType: variables.template.dataType,
    headers: variables.template.header,
    data: JSON.stringify({accessToken, base64Data, targetLanguage})
    })
    .done((data) => {
      console.log(data);
      })
    .fail((jqXHR) => console.error(JSON.parse(jqXHR.responseText), jqXHR.status));
  }

const load = () => {
  show(elements.textRecognition);

  elements.login.find('#l-sign-in').on('click', loginUser);
  elements.signup.find('#s-sign-up').on('click', signup);
  elements.signupConfirm.find('#sc-continue').on('click', confirm);
  elements.signupConfirm.find('#sc-resend').on('click', resendCode);
  elements.resetEmail.find('#re-send').on('click', resendCode);
  elements.resetNew.find('#rn-resend').on('click', resendCode);
  elements.resetNew.find('#rn-continue').on('click', newPassword);
  elements.textRecognition.find('#tr-send').on('click', recognizeAndTranslate);

  elements.textRecognition.find('#tr-copy').on('click', readFromClipboard);
  elements.textRecognition.find('#tr-recognised-copy').on('click', () => 
    writeToClipboard(elements.textRecognition.find('#tr-recognised > pre').text())
    );
  elements.textRecognition.find('#tr-translated-copy').on('click', () => 
    writeToClipboard(elements.textRecognition.find('#tr-translated > pre').text())
    );

  $('.button-return').on('click', () => {
    [variables.userEmail, variables.accessToken, variables.refreshToken, variables.base64Data] = Array.from({length: 4}).map(e => null);
    show(elements.login);
    });
  elements.login.find('#l-sign-up').on('click', () => show(elements.signup));
  elements.login.find('#l-reset-password').on('click', () => show(elements.resetEmail));

  }
$(document).ready(load);