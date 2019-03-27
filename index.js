require('dotenv').config({path: ".env"})

const path = require('path'),
      ora = require('ora'),
      currentPath = path.resolve(__dirname, 'boletos')

const scrappers = {
    unimed: require('./scrappers/unimed'),
    copel: require('./scrappers/copel'),
    ultragaz: require('./scrappers/ultragaz'),
}

async function start() {

    let spinner;

    spinner = ora('Iniciando o BotBoleto').start();
    spinner.succeed()

    spinner = ora('Iniciando o UnimedBot').start();
    spinner = await scrappers.unimed(currentPath, spinner)
    spinner.text = 'UnimedBot finalizado!';
    spinner.succeed()

    spinner = ora('Iniciando o CopelBot').start();
    spinner = await scrappers.copel(currentPath, spinner)
    spinner.text = 'CopelBot finalizado!';
    spinner.succeed()

    spinner = ora('Iniciando o Ultragaz').start();
    spinner = await scrappers.ultragaz(currentPath, spinner)
    spinner.text = 'Ultragaz finalizado!';
    spinner.succeed()    

}

start()
