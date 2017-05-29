'use strict';

const {join, basename, extname} = require('path');
const marked = require('marked');
const glob = require('glob').sync;
const fs = require('fs');
const firebase = require('firebase-admin');
const cloudStorage = require('@google-cloud/storage');

const PROJECT_DIR = join(__dirname, '..');
const CONTENT_DIR = join(PROJECT_DIR, 'src/assets/guides');
const FIREBASE_TOKEN = decodeToken(process.env['HELP_V2_FIREBASE_TOKEN']);

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


// Publish guides on Firebase
removeGuides()
  .then(() => publishImages())
  .then(() => publishGuides())
  .then(() => console.log('Uploaded all guides to firebase.'))
  .then(() => firebaseApp.delete(), (err) => {console.error(err); return firebaseApp.delete();});

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

    if (!title) {
      console.error(`Error: Guide "${fileName}" does not have any @title set!`);
      process.exit(1);
    }

    // Store the guide with a specific canonical name in the firebase database.
    return guidesRef.child(canonicalName).set({
      title: title,
      group: group,
      content: markedContent
    });
  }));
}

function publishImages() {
  return Promise.all(images.map(fileName => {
    const canonicalName = basename(fileName).replace(extname(fileName), '').toLowerCase();
    return guidesBucket.upload(fileName);
  }));
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
