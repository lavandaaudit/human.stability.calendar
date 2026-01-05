// server.js
const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// GET /holidays/:dateStr (YYYY-MM-DD)
app.get('/holidays/:dateStr', async (req, res) => {
  try {
    const date = new Date(req.params.dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('uk-UA', { month: 'long' });

    const wikiUrl = `https://uk.wikipedia.org/wiki/${day}_${month}`;
    const response = await fetch(wikiUrl);
    const html = await response.text();

    const $ = cheerio.load(html);
    let holidays = [];

    // Беремо всі <li> у секції "Свята і пам'ятні дні" або "Свята"
    $('span#Свята_і_пам%27ятні_дні').parent().nextAll('ul').first().find('li').each((i, el) => {
      holidays.push($(el).text());
    });

    if(holidays.length === 0){
      holidays.push('Свят сьогодні немає');
    }

    res.json({ holidays });
  } catch(e){
    console.error(e);
    res.json({ holidays: ['Не вдалося підвантажити свята'] });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
