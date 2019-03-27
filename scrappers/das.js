const puppeteer = require('puppeteer'),
      fs = require('fs'),
      prompts = require('prompts');

const chromeOptions = {
  headless:false,
  defaultViewport: null};

async function init(path, spinner, CNPJ) {
  
  const browser = await puppeteer.launch(chromeOptions);
  const page = await browser.newPage();

  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow', downloadPath: path});

  spinner.text = 'Acessando site do MEI'
  await page.goto(process.env.DAS_URL);

  await page.type('#cnpj', CNPJ, {delay: 50})
  
  spinner.text = 'Vou te pedir um favor...'
  spinner.info()

  let code;
  let reply = await prompts({
    type: 'text',
    name: 'code',
    message: 'O que está escrito no captcha?'
  });

  code = reply.code

  spinner.start('Retornando...')

  await page.type('input[name=textoCaptcha]', code)

  await page.click('button[type=submit]')
  
  await page.waitForSelector('.panel-default')
  
  await page.goto('http://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao')
  
  spinner.text = 'Por favor, selecione o ano no calendário...'
  spinner.info()

  await page.waitForSelector('table.emissao')
  
  spinner.text = 'Localizando o DAS do mês...'
  await page.evaluate((month) => { 
    
    let all = document.querySelectorAll('table.emissao tr')
    let arr = Array.from(all)
    
    let day = `/${month}/${(new Date()).getFullYear()}`
    
    let el = Array.from(arr.filter(tr => 
            tr.children[3].innerText === "A Vencer"
            && tr.children[9].innerText.indexOf(day) !== -1))
            
    if (el[0] !== undefined) {
      el[0].setAttribute('class', 'bg-warning')
      el[0].children[0].setAttribute('checked', 'checked')
      el[0].children[0].querySelector('input[type=checkbox]').setAttribute('checked', 'checked')
    }
    
    return false
    
  }, getCurrentMonth());
  
  //
  spinner.text = 'Emitindo o boleto...'
  await page.click('#btnEmitirDas')

  await page.waitForSelector('div.panel-footer > div > div > a:nth-child(1)')

  await page.click('div.panel-footer > div > div > a:nth-child(1)')

  browser.close()
  
  return spinner;
}

function getCurrentMonth() {
  var date = new Date(),
      month = date.getMonth() + 2;
  return month+1 < 10 ? ("0" + month) : month;
}

module.exports = init