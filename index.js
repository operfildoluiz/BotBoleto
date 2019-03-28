require('dotenv').config({path: ".env"})

const path = require('path'),
      ora = require('ora'),
      currentPath = path.resolve(__dirname, 'boletos')

const services = [
    {
        name: 'Unimed',
        scrapper: require('./scrappers/unimed')
    },
    {
        name: 'Copel',
        scrapper: require('./scrappers/copel'),
        params: []
    },
    {
        name: 'Ultragaz',
        scrapper: require('./scrappers/ultragaz'),
        params: []
    },
    {
        name: 'DASMEIBot1',
        scrapper: require('./scrappers/das'),
        params: [
            process.env.DAS_CNPJ1
        ]
    },
    {
        name: 'DASMEIBot2',
        scrapper: require('./scrappers/das'),
        params: [
            process.env.DAS_CNPJ2
        ]
    }
]

async function start() {
    const promises = services.map(async service => {
        const spinner = ora(`Iniciando ${service.name}`).start()
        await service.scrapper(currentPath, spinner, ...service.params)
        spinner.text = '${service.name} finalizado!'
        spinner.succed()
    })

    await Promise.all(promises)
    console.log('Finalizado')
}

start()
