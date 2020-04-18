const fs = require('fs');

//Blocking - Sync
const text = fs.readFileSync('avocado.txt', 'utf-8');
fs.writeFileSync('avocado2.txt', text);
console.log('File was already written');

//Non-blocking - Async
fs.readFile('outer.txt', 'utf-8', (err, data1) => {
  // 'avocado' is written in outer file
  if (err) {
    return console.log('ERROR!');
  }

  fs.readFile(`${data1}.txt`, 'utf-8', (err, data2) => {
    console.log(data2);
  });
});
console.log('Will read file');
