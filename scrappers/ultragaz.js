const puppeteer = require('puppeteer')

const chromeOptions = {
  headless:true,
  defaultViewport: null};

async function init(path, spinner) {
  
  const browser = await puppeteer.launch(chromeOptions);
  const page = await browser.newPage();

  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow', downloadPath: path});

  spinner.text = 'Acessando site da Ultragaz'
  await page.goto(process.env.ULTRAGAZ_URL);
  await page.type('#username', process.env.ULTRAGAZ_LOGIN)
  await page.type('#senha', process.env.ULTRAGAZ_SENHA)

  await page.click('#btnValidate')
  
  await page.waitForSelector('#bs-sidebar-navbar-collapse-1 > ul > li:nth-child(2) > a') 
  await page.evaluate(() => { 
    let boga = document.querySelectorAll('#bs-sidebar-navbar-collapse-1 > ul > li:nth-child(2) > a')[0]
    boga.click()
  });

  spinner.text = 'Localizando o boleto'
  await page.waitForSelector('#demonstrativos-lista-demonstrativos_wrapper') 

  let code = await page.evaluate((month) => { 

    let all = document.querySelectorAll('#demonstrativos-lista-demonstrativos_wrapper tr')
    let arr = Array.from(all)

    let day = `/${month}/${(new Date()).getFullYear()}`

    let el = Array.from(arr.filter(tr => 
            tr.children[4].innerText === "EMITIDO"
            && tr.children[2].innerText.indexOf(day) !== -1))
            
    if (el[0] !== undefined) {
      return el[0].querySelector('td:last-child a').getAttribute('data-id')
    }

    return false
    
  }, getCurrentMonth());

  if (code) {

    try {
      await page.goto(`https://ug.force.com/mi/apex/MIBoletoPDF?bolId=${code}`)
    } catch(e) {
      await page.waitFor(3000)
      browser.close()
    }
  }

  return spinner;
}

function getCurrentMonth() {
  var date = new Date(),
      month = date.getMonth() + 2;
  return month+1 < 10 ? ("0" + month) : month;
}

module.exports = init