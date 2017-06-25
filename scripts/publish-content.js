'use strict';

const {join, basename, extname, dirname} = require('path');
const marked = require('marked');
const glob = require('glob').sync;
const fs = require('fs');
const firebase = require('firebase-admin');
const cloudStorage = require('@google-cloud/storage');
const inlineImages = require('./inline-images');

const PROJECT_DIR = join(__dirname, '..');
const CONTENT_DIR = join(PROJECT_DIR, 'src/assets/guides');
const FIREBASE_TOKEN = decodeToken(process.env['HELP_V2_FIREBASE_TOKEN']) || '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCnYRBxur17F0rS\nEyf6HtkVAAzMjd9x9/FDgUYbaRX2l2WrPrGqPD2qHJI5LQ5n7SrZkf02P8+cHXL2\nNof0eA2J2i8Tbl/R/IuBm3+H7PWS3iwm8OBv8Cvz/z+DUkQ0fjP3A4tBZIPleqbQ\nY28ryqwSuBCpQoXrucA89ekyXLXo+2NpprZ2fuSdPH7EBfFK5fgJYrXyAO47PC8n\noCe/KlF+qtb81O1weWUyB72fnmpBRas7YvPj4T/qJ2c1ql3JClZtL1cjBrqA3vKY\niYpHHs9dxbgkJDaK0y/oB/7aRQ3jUBY7Rh9VjZ6Ks3brHS9weoXQLuHHThKO2xsl\n0Wy675jlAgMBAAECggEAEqWAlHruQvk8T5zstjObkXhY9KzVeLfbe9659bHGTZte\nKy6n0kQ1xm66Z346fZ9xR5247MM9GLI7LWyzxqtdLr9MwUhpilYtIHo3QehHD16K\n4qexCSdjbiJAbBvNF1/74AfYCqfs/bKlRM/fAazpcIhq6sBLdRBTdzcaDI9BgLva\nX4JU2NRW80MwFLh542NIct2RlbMKwVwL+17sVzrqwnTzz1wfCs84kvXKNdKyb6pp\n1erFwZd1mpxSCMTtg0+wfGN3I97Yncz4V0Ps7uOryhjwI2Y7NbRBCCpCAt8I21+a\n4GG7WKaJHOUO/OJXg6jufFoM0BU2US1+QF21L9O1nQKBgQDlqCoiNTDyQTuqeA54\nkGiR0EbuZShHplb8qQDiaTZ1tG3vDO4WX+E+esDNtpQlMiMA/zQQSOnjT4TxLiPO\n3LUtBvDk/uakjZ4soHifTu7ppBdw2XKNU5oShy95eYAJFxNWDy5NuxJHsu6byBRR\nGhfoY7goG+DIrzf0AKqVkuBrdwKBgQC6lB/kr4DL+oV2kyBenF03cWKXpM7RIoZE\nkqWXqPB1Ljbvke719VczKD1S36Vz2z8VhLVnpHYBQruLRlxv2S5If4bMfQweD/Ma\nLwlfSEBaftp8S9aPy/tpc6oyGOMu3CPYwJn8FlS1FDZ3avBPWP/V3cVVETdGxjkI\n/sshKDz9gwKBgDiIph6Xo33vSwXS2hUZz3QdpmhnJHxG2WEHJX2W0t401V8kerOt\nVKBxzWaWjG9/oRhMun9Lw6++UoagihYRRNRZwhFNIm/doNNxiWAGKVAAofiYvtdF\nfkcTWj94Bmm2cX8c65Qc+goGZTCaF05DsyD080+EVVhxsb9yLov1hSNPAoGAWq4b\nQh46TukXbKXdGZ6Nf6DP9jvXeLV65GERskAdfhZUBOO8bDYth2OLSngABesNIfw5\n3oGECODSHcK4snOvlvTEIyazePjvgk5SE8kd3d3Bep+xTHorWvkoQujtoZzEn1gc\nfvSrfsawIiILYcUzslHy0oFniDJXDhQnzZms6tkCgYAnJDXCh1tVn+6RgwSiSds/\n75c9TfBxb3z9V9qZZOyryQ9Sb3ROi5U6ZzbMwgE8OIAe1dJDhFcYTeAdU/B2WvxQ\nrmztsoXMg27WLj2AMoOF0UzqxZpj++0QlS3TqY+2+ZlYCu3cH5/VIosgEK+7tiS6\ngaxHCUHBBnNUIcDYM2783A==\n-----END PRIVATE KEY-----\n';

if (!FIREBASE_TOKEN) {
  console.error('No firebase private key specified. Set the "HELP_V2_FIREBASE_TOKEN" variable!');
  return;
}

// Setup firebase project constants
const FIREBASE_DATABASE_URL = 'https://help-v2-e856d.firebaseio.com';
const FIREBASE_PROJECT_ID = 'help-v2-e856d';
const FIREBASE_CLIENT_EMAIL = 'firebase-adminsdk-sgyjb@help-v2-e856d.iam.gserviceaccount.com';
const FIREBASE_STORAGE_BUCKET = 'help-v2-e856d.appspot.com';

const firebaseApp = firebase.initializeApp({
  credential: firebase.credential.cert({
    project_id: FIREBASE_PROJECT_ID,
    private_key: FIREBASE_TOKEN,
    client_email: FIREBASE_CLIENT_EMAIL
  }),
  databaseURL: FIREBASE_DATABASE_URL
});

const storage = cloudStorage({
  projectId: FIREBASE_PROJECT_ID,
  credentials: {
    private_key: FIREBASE_TOKEN,
    client_email: FIREBASE_CLIENT_EMAIL
  }
});

const guidesRef = firebase.database().ref('guides');
const guidesBucket = storage.bucket(FIREBASE_STORAGE_BUCKET);

const guides = glob('**/*.md', {cwd: CONTENT_DIR});
const images = glob('**/*.+(png|jpg|gif)', {cwd: CONTENT_DIR});

removeGuides()
  .then(() => deleteOldImages())
  .then(() => console.log('Deleted all outdated images from the Firebase storage.'))
  .then(() => publishImages())
  .then(() => console.log('Uploaded all images to the Firebase storage'))
  .then(() => publishGuides())
  .then(() => console.log('Uploaded all guides to firebase.'))
  .then(() => firebaseApp.delete(), (err) => {console.error(err); return firebaseApp.delete();})

/** Removes all guides from Firebase */
function removeGuides() {
  return guidesRef.remove();
}

/** Publishes all guides on Firebase */
function publishGuides() {
  return Promise.all(guides.map(fileName => {
    const canonicalName = basename(fileName).replace(extname(fileName), '').toLowerCase();
    const fileContent = fs.readFileSync(join(CONTENT_DIR, fileName), 'utf-8');

    const title = readVariable('title', fileContent);
    const group = readVariable('group', fileContent);
    const markedContent = marked(filterVariables(fileContent));
    const inlinedContent = inlineImages(markedContent, dirname(fileName), FIREBASE_STORAGE_BUCKET);

    if (!title) {
      console.error(`Error: Guide "${fileName}" does not have any @title set!`);
      process.exit(1);
    }

    // Store the guide with a specific canonical name in the firebase database.
    return guidesRef.child(canonicalName).set({
      title: title,
      group: group,
      content: inlinedContent
    });
  }));
}

/** Uploads all images of guides to the Firebase storage. Base directories will be preserved. */
function publishImages() {
  return Promise.all(images.map(filePath => {
    return guidesBucket.upload(join(CONTENT_DIR, filePath), {destination: filePath, public: true });
  }));
}

/** Deletes all outdated images form the Firebase storage bucket. */
function deleteOldImages() {
  return guidesBucket.getFiles()
    .then(data => data[0])
    .then(files => files.filter(file => !fs.existsSync(join(CONTENT_DIR, file.name))))
    .then(files => Promise.all(files.map(file => file.delete())))
}

/** Read a variable from a file using the annotation symbol. */
function readVariable(variable, input) {
  const matches = new RegExp(`^\\s?@${variable}\\s+(.+)$`, 'igm').exec(input);
  return matches && matches[1];
}

/** Deletes all variables from a Markdown file. */
function filterVariables(input) {
  return input.replace(new RegExp(`^\\s?@(\\w)+\\s+(.+)$`, 'igm'), '');
}

/** Decodes a token from Travis CI */
function decodeToken(token) {
  // In Travis CI the private key will be incorrect because the line-breaks are escaped.
  // The line-breaks need to persist in the service account private key.
  return (token || '').replace(/\\n/g, '\n');
}
