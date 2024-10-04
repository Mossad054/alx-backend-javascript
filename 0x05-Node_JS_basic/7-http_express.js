const express = require('express');
const { promises: fs } = require('fs');
const { argv } = require('process');

const app = express();
const port = 1245;

async function countStudents(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const lines = data.trim().split('\n');
    const students = lines.slice(1).filter(line => line.trim() !== '').map(line => line.split(','));

    const totalStudents = students.length;
    const fieldCounts = {};
    const studentsByField = {};

    students.forEach(([firstName, , , field]) => {
      if (!fieldCounts[field]) {
        fieldCounts[field] = 0;
        studentsByField[field] = [];
      }
      fieldCounts[field]++;
      studentsByField[field].push(firstName);
    });

    let output = `Number of students: ${totalStudents}\n`;
    for (const [field, count] of Object.entries(fieldCounts)) {
      output += `Number of students in ${field}: ${count}. List: ${studentsByField[field].join(', ')}\n`;
    }

    return output;
  } catch (error) {
    throw new Error('Cannot load the database');
  }
}

app.get('/', (req, res) => {
  res.type('text/plain');
  res.send('Hello Holberton School!');
});

app.get('/students', async (req, res) => {
  res.type('text/plain');
  res.write('This is the list of our students\n');
  try {
    const studentsInfo = await countStudents(argv[2]);
    res.write(studentsInfo);
    res.end();
  } catch (error) {
    res.status(500).end(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

module.exports = app;
