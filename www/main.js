const mainForm = document.getElementById('mainForm');
const pepe = document.getElementById('pepe');
const fail = document.getElementById('fail');
const success = document.getElementById('success');

async function load(){
  initSites();
  const backend = await carlo.loadParams();

  mainForm.onsubmit = async event => {
    event.preventDefault();
    pepe.style.display = 'block';
    mainForm.style.display = 'none';
    let obj = {};
    const sites = [];
    document.querySelectorAll('input[type=text], input[type=number], input[type=radio]:checked').forEach(input => {
      if((input.name === 'lineItemId') && (input.value.search(/lineitemid=(\d{10})/gi) > -1)) {
        input.value = /\d{10}/g.exec(input.value.match(/lineitemid=(\d{10})/gi)[0]);
      }
      obj[input.name] = input.value;
    });
    document.querySelectorAll('input[type=checkbox]:checked').forEach(site => {
        sites.push(site.value);
    });
    obj['sites'] = sites;
    for(let idx=0; idx < mainForm.elements.length; idx++){
      mainForm.elements[idx].disabled = true;
    }

    await backend.batchScreenshot(JSON.stringify(obj))
    .then(failedTask => {
      console.log(failedTask);
      pepe.style.display = 'none';
      success.style.display = 'block';
      if(failedTask){
        failedTask.forEach(failedTask => {
          success.appendChild(htmlToElement(`
            <p style='border-style: solid; border-width:1px 0 0 0;padding-top: 1em;'>filename: ${failedTask.preview.filename}</p>
            <p>device: ${failedTask.preview.device}</p>
            <p>url: ${failedTask.preview.url}</p>
            <p style='border-style: solid; border-width:0 0 1px 0;padding-bottom: 1em;'>error: ${failedTask.error}</p>
          `));
        });  
      }
    })
    .catch( err => {
      pepe.style.display = 'none';
      fail.style.display = 'block';
      fail.appendChild(document.createTextNode(err));
    });
  };
}

function check(){
  const input = document.getElementById('lineItemId');
  const submit = document.getElementById('submit');
  if((input.value.search(/lineitemid=(\d{10})/gi) > -1) || (input.value.search(/^\d{10}$/) > -1)){
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
    if (document.querySelector('input[type=checkbox]:checked') !== null) {
      submit.disabled = false;
    }
  } else {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    submit.disabled = true;
  }
}

function initSites(){
  const male = ['bola.net', 'merdeka.com', 'otosia.com', 'bola.com', 'liputan6.com'];
  const female = ['kapanlagi.com', 'fimela.com', 'dream.co.id'];
  male.forEach(site => {
    initCombobox('maleSite', site);
  });
  female.forEach(site => {
    initCombobox('femaleSite', site);
  });
}

function initCombobox(containter, site){
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  label.for = site;
  label.classList.add('pure-checkbox');
  checkbox.setAttribute('id', site);
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('value', site);
  checkbox.setAttribute('name', 'sites');
  checkbox.onchange = check;
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(site));
  document.getElementById(containter).appendChild(label);
}

function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content;
}