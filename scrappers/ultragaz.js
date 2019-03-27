const puppeteer = require('puppeteer'),
      prompts = require('prompts');

const chromeOptions = {
  headless:false,
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

  await page.waitForSelector('#demonstrativos-lista-demonstrativos_wrapper') 

  let filtered = await page.evaluate(() => { 

    let all = document.querySelectorAll('#demonstrativos-lista-demonstrativos_wrapper tr')
    let arr = Array.from(all)
    return Array.from(arr.filter(tr => tr.children[4].innerText === "EMITIDO"))
    
  });

  console.log(filtered);
  

  // for (let index = 0; index < filtered.length; index++) {

  //   // await page.pdf({path: `${path}/gaz_${index}.pdf`})
  // }

  return spinner;
}


module.exports = init