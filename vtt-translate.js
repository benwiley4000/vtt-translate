const webvtt = require('node-webvtt');
const fs = require('fs');
const fetch = require('isomorphic-fetch');
const assert = require('assert');

function stringifyRequest(inputStrings, params) {
  params = Object.assign({}, params);
  params.format = 'text';
  delete params.q;
  delete params.key;
  delete params.restoredCuesPathname;
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
  let translatedCues = [];
  if (params.restoredCuesPathname) {
    try {
      translatedCues = JSON.parse(await readFile(params.restoredCuesPathname));
      assert(translatedCues.isArray());
    } catch (err) {
      translatedCues = [];
    }
  }
  let i = 0;
  for (; i < translatedCues.length && i < parsed.cues.length; i++) {
    parsed.cues[i].text = translatedCues[i];
  }

  const max_fetch_size = 128;
  for (; i < parsed.cues.length; i += max_fetch_size) {
    const cues = parsed.cues.slice(i, i + max_fetch_size);
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: 'POST',
      body: stringifyRequest(cues.map(cue => cue.text), params)
    }).then(res => res.json());
    if (response.error) {
      response.error.translatedCues = translatedCues;
      return Promise.reject(response.error);
    }
    for (let j = 0; j < response.data.translations.length; j++) {
      const { translatedText } = response.data.translations[j];
      parsed.cues[i + j].text = translatedText;
      translatedCues[i + j] = translatedText;
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
