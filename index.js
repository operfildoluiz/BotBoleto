require('dotenv').config({path: ".env"})

const path = require('path'),
      ora = require('ora'),
      currentPath = path.resolve(__dirname, 'boletos')

const scrappers = {
    unimed: require('./scrappers/unimed'),
    copel: require('./scrappers/copel'),
    ultragaz: require('./scrappers/ultragaz'),
    das: require('./scrappers/das'),
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

    spinner = ora('Iniciando o UltragazBot').start();
    spinner = await scrappers.ultragaz(currentPath, spinner)
    spinner.text = 'UltragazBot finalizado!';
    spinner.succeed()    

    spinner = ora('Iniciando o DASMEIBot #1').start();
    spinner = await scrappers.das(currentPath, spinner, process.env.DAS_CNPJ1)
    spinner.text = 'DASMEIBot #1 finalizado!';
    spinner.succeed()     

    spinner = ora('Iniciando o DASMEIBot #2').start();
    spinner = await scrappers.das(currentPath, spinner, process.env.DAS_CNPJ2)
    spinner.text = 'DASMEIBot #2 finalizado!';
    spinner.succeed()     

}

start()
