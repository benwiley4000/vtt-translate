# vtt-translate

Not exactly the best idea...

...but you can use this to Google Translate your .vtt subtitle files into other languages!

Requires [Node.js](https://nodejs.org) 7.10.1 or later.

## command line

### install

```console
npm install --global vtt-translate
```

### use

```console
$ vtt-translate 
Input VTT filename: ./vtt/transcript_en.vtt
Source language code: en
Destination language code: fr
Google Translate API key (https://cloud.google.com/translate/): [Paste your API key here]
Translating...
Translation complete!
Destination VTT filename: ./vtt/transcript_fr.vtt
$
```

(Note that API limits apply... if you fill your daily quota, a restore file will be saved so you can continue the next day without losing your progress.)

See the Node API description for explanation of the command line inputs.

## Node API

### install

```console
npm install --save vtt-translate
```

### use

This API example is functionally identical to the earlier command line example.

```js
const { getTranslatedVttForPathname } = require('vtt-translate');
const fs = require('fs');

const pathname = './vtt/transcript_en.vtt';
const apiKey = '[Paste your API key here]';
const source = 'en';
const target = 'fr';

getTranslatedVttForPathname(pathname, apiKey, { source, target })
  .then(vttContent => {
    fs.writeFile('./vtt/transcript_fr.vtt', vttContent, err => {
      if (err) {
        console.error(err);
      }
    });
  })
  .catch(err => {
    console.error(err);
  });
```

### API

#### `getTranslatedVttForPathname(pathname, apiKey, params)`

#### Arguments
* `pathname`: The filesystem pathname for the source vtt file.
* `apiKey`: A valid Google Cloud Translation API key
* `params.source`: A [language code supported by Google's Neural Machine Translation Model](https://cloud.google.com/translate/docs/languages#languages-nmt), corresponding to the language of the source text (e.g. `'en'`)
* `params.target` A language code corresponding to the translation target language
* `params.restoredCuesPathname`: A pathname pointing to a JSON file saved with a backup of previously translated cues (see error handling)

#### Returns
A `Promise` which resolves with the full text of the translated vtt file (as a string)

#### Error handling
If you `.catch` an error and the error has a `translatedCues` property, you can save that object to a json file and restore it later with `params.restoredCuesPathname`. This allows downloading a translation across multiple days if your API request quota is too small to download the translation in one day.
