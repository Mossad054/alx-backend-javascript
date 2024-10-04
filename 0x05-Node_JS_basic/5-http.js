const http = require('http');
const fs = require('fs').promises;
const { argv } = require('process');

const hostname = 'localhost';
const port = 1245;

async function countStudents(path) {
  try {
    const data = await fs.readFile(path, 'utf8');
    const rows = data.trim().split('\n').map(row => row.split(','));
    const headers = rows.shift();
    const studentsByField = rows.reduce((acc, row) => {
      const field = row[headers.indexOf('field')];
      const firstName = row[headers.indexOf('firstname')];
      if (!acc[field]) acc[field] = [];
      acc[field].push(firstName);
      return acc;
    }, {});

    let output = `Number of students: ${rows.length}\n`;
    for (const [field, students] of Object.entries(studentsByField)) {
      output += `Number of students in ${field}: ${students.length}. List: ${students.join(', ')}\n`;
    }
    return output.trim();
  } catch (error) {
    throw new Error('Cannot load the database');
  }
}

const app = http.createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');

  switch (req.url) {
    case '/':
      res.end('Hello Holberton School!');
      break;
    case '/students':
      res.write('This is the list of our students\n');
      try {
        const output = await countStudents(argv[2]);
        res.end(output);
      } catch (error) {
        res.statusCode = 404;
        res.end(error.message);
      }
      break;
    default:
      res.statusCode = 404;
      res.end('Not found');
  }
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

module.exports = app;
