const webvtt = require('node-webvtt');
const fs = require('fs');
const fetch = require('isomorphic-fetch');

function stringifyRequest(inputStrings, params) {
  params = Object.assign({}, params);
  params.format = 'text';
  delete params.q;
  delete params.key;
  let s = JSON.stringify(params);
  s = s.slice(0, -1);
  for (const input of inputStrings) {
    s += ',"q":' + JSON.stringify(input);
  }
  s += '}';
  return s;
}

// mutates
async function translateParsedVtt(parsed, apiKey, params) {
  const max_fetch_size = 128;
  for (let i = 0; i < parsed.cues.length; i += max_fetch_size) {
    const cues = parsed.cues.slice(i, i + max_fetch_size);
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: 'POST',
      body: stringifyRequest(cues.map(cue => cue.text), params)
    }).then(res => res.json());
    if (response.error) {
      return Promise.reject(response.error);
    }
    for (let j = 0; j < response.data.translations.length; j++) {
      parsed.cues[j].text = response.data.translations[j].translatedText;
    }
  }
}

function readFile(pathname) {
  return new Promise((resolve, reject) => {
    fs.readFile(pathname, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function getTranslatedVttForPathname(pathname, apiKey, params) {
  const data = await readFile(pathname);
  const parsed = webvtt.parse(data);
  await translateParsedVtt(parsed, apiKey, params);
  return webvtt.compile(parsed);
}

module.exports = {
  getTranslatedVttForPathname
};
