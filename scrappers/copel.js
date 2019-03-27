const puppeteer = require('puppeteer'),
      fs = require('fs'),
      prompts = require('prompts');

const chromeOptions = {
  headless:false,
  defaultViewport: null};

async function init(path, spinner) {
  
  const browser = await puppeteer.launch(chromeOptions);
  const page = await browser.newPage();

  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow', downloadPath: path});

  spinner.text = 'Acessando site da Copel'
  await page.goto(process.env.COPEL_URL);
  await page.type('#segundaViaFacil > ul li:nth-child(1) > input', process.env.COPEL_CPF)
  await page.type('#segundaViaFacil > ul li:nth-child(4) input', process.env.COPEL_NUM)

  spinner.info()

  let code;
  let reply = await prompts({
    type: 'text',
    name: 'code',
    message: 'O que está escrito no captcha?'
  });

  code = reply.code

  spinner.start('Retornando...')

  await page.type('#segundaViaFacil > ul li:nth-child(7) input', code)

  await page.click('#segundaViaFacil input[type=submit]')

  await page.waitForSelector('.conteudoInterna table a') 
  await page.evaluate(() => { 

    let boga = document.querySelectorAll('.conteudoInterna table a')[0]
    boga.click()
    console.log(boga);
    
  });

  await page.waitForSelector('.conteudoInterna input:nth-child(2)') 
  await page.type('.conteudoInterna input:nth-child(2)', process.env.COPEL_MAE)
  await page.click('.conteudoInterna input[type=submit]')

  await page.waitForSelector('.conteudoInterna table a') 
  await page.evaluate(() => { 

    let boga = document.querySelectorAll('.conteudoInterna table a')[0]
    boga.click()
    console.log(boga);
    
  });

  await page.waitForSelector('#j_id7') 
  await page.waitForSelector('#j_id28') 
  
  const barcode = await page.$$eval('#j_id28 .rich-table-row table:nth-child(3) tr:nth-child(1) td:nth-child(2)', tds => tds.map((td) => {
    return td.innerText;
  }));

  const total = await page.$$eval('#j_id7 .rich-table-row table:nth-child(2) tr:nth-child(5) td:nth-child(2)', tds => tds.map((td) => {
    return td.innerText;
  }));  

  const date = await page.$$eval('#j_id7 .rich-table-row table:nth-child(2) tr:nth-child(4) td:nth-child(2)', tds => tds.map((td) => {
    return td.innerText;
  }));    
  
  let obj = {
    barcode: barcode[0],
    total: total[0],
    date: date[0],
  }
  
  fs.writeFileSync(`${path}/copel.json`, JSON.stringify(obj, null, 4))

  browser.close()

  return spinner;
}

async function getAttributeOf(selector, attr, page) {
  return page.$eval(selector, (el, attribute) => el.getAttribute(attribute), attr);
}

module.exports = init