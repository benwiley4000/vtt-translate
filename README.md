# vtt-translate

Not exactly the best idea...

...but you can use this to Google Translate your .vtt subtitle files into other languages!

Requires [Node.js](https://nodejs.org) 7.10.1 or later.

### disclaimer

I really want to emphasize that this isn't a great way to produce a translation for your video/audio content. The best way is to hire a professional translator. If you have a budget for producing your content, and you need a translation, please allocate some of that budget for paying a translator.

If you're working on a volunteer-based project with no budget, or you just need some test data, this can work well enough for you.

Keep in mind that translations are done line by line, so they can and probably will be occasionally mistranslated due to lack of context.

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
See the [Node API](#node-api) description for explanation of the command line inputs.

Note that API limits apply... if you fill your daily quota, a restore file will be saved so you can continue the next day without losing your progress:

```console
$ vtt-translate 
Input VTT filename: ./vtt/transcript_en.vtt
Source language code: en
Destination language code: fr
Google Translate API key (https://cloud.google.com/translate/): [Paste your API key here]
Translating...
{ code: 403,
  message: 'User Rate Limit Exceeded',
  errors: 
   [ { message: 'User Rate Limit Exceeded',
       domain: 'usageLimits',
       reason: 'userRateLimitExceeded' } ],
  translatedCues: 
   [ ... ] }

Saving temp file so we can resume later where we left off...
Progress: 2688 of 2767 cues (2688 newly translated)
$
```

Don't remove this temp file! Otherwise you'll have to start over from scratch later.

Once the download completes, the temp file will be deleted automatically.

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
