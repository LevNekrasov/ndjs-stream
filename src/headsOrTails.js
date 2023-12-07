#!/usr/bin/env node

const fs = require('fs');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const rl = readline.createInterface({ input, output });
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');

let number = Math.round(Math.random() * 2);
console.log("🚀 ~ file: headsOrTails.js:11 ~ number:", number)
let logs = [];
let fileData = '';
let iterations = 0;
let successCounter = 0;

const argv = yargs(hideBin(process.argv))
  .option('f', {
    alias: 'file',
    type: 'string',
    default: 'log',
    description: 'Имя файла для логов',
  })
  .argv;

// проверяем, есть ли файл с таким именем
fs.stat(`${argv.f}.json`, (error) => {
  // если файла нет - создаем
  if (error) {
    fs.writeFile(`${argv.f}.json`, '', (err) => {
      if (err) throw err;
    });
  } else {
    // если файл ест - читаем
    const readStream = fs.createReadStream(`${argv.f}.json`);

    readStream
      .setEncoding('utf-8')
      .on('data', (chunk) => fileData += chunk)
      .on('end', () => {
        try {
          const parsedData = JSON.parse(fileData);
          if (Array.isArray(parsedData)) logs = parsedData;
        } catch (error) {
          // console.log('error :>> ', error);
        }
      });
  }
});

const question = (message) => {
  return new Promise((resolve, reject) => rl.question(message, answer => resolve(answer)));
};

const main = async () => {
  console.log('Привет! Поиграем в "орёл или решка"? Орёл = 1, решка = 0. Попробуй угадать :)');

  let isSuccess = false;

  while (!isSuccess) {
    const answer = await question('Попробуйте отгадать: ');

    isSuccess = +answer === number;

    if (isSuccess) successCounter += 1;
    if (!isSuccess) {
      console.log('Нет! Подбрасываю монетку снова ;)');
      number = Math.floor(Math.random() * 2);
    }
    
    iterations += 1;
  }

  console.log('🎉 🎉 🎉 Ура! Верно!');

  const again = await question('Ещё раз? (y/n)');

  if (again.toLowerCase() === 'y') main();
  else {
    console.log('Пока!');

    logs.push({
      endTime: new Date(),
      iterations,
      success: successCounter,
      failed: iterations - successCounter,
    });

    let commonCounter = 0;
    let success = 0;
    let failed = 0;

    logs.forEach((item) => {
      commonCounter += item.iterations;
      success += item.success;
      failed += item.failed;
    });

    const successPercent = success * 100 / commonCounter;

    console.log('<========================================>');
    console.log('общее количество партий (за все игры)    : ', commonCounter);
    console.log('количество выигранных/проигранных партий : ', `${success} / ${failed}`);
    console.log('процентное соотношение выигранных партий : ', Math.round(successPercent),'%');
    console.log('<========================================>');

    const writeStream = fs.createWriteStream(`${argv.f}.json`);

    writeStream.write(JSON.stringify(logs, null, '    '));
    writeStream.end();

    rl.close();
  }
};

main();
