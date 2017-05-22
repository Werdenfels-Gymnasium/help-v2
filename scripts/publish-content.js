'use strict';

const {join, basename} = require('path');
const marked = require('marked');
const glob = require('glob').sync;
const fs = require('fs');
const firebase = require('firebase-admin');

const PROJECT_DIR = join(__dirname, '..');
const CONTENT_DIR = join(PROJECT_DIR, 'src/assets/guides');
const FIREBASE_TOKEN = decodeToken(process.env['HELP_V2_FIREBASE_TOKEN']);

if (!FIREBASE_TOKEN) {
  console.error('No firebase private key specified. Set the "HELP_V2_FIREBASE_TOKEN" variable!');
  return;
}

const guides = glob('**/*.md', {cwd: CONTENT_DIR});

const firebaseApp = firebase.initializeApp({
  credential: firebase.credential.cert({
    project_id: "help-v2-e856d",
    private_key: FIREBASE_TOKEN,
    client_email: "firebase-adminsdk-sgyjb@help-v2-e856d.iam.gserviceaccount.com"
  }),
  databaseURL: "https://help-v2-e856d.firebaseio.com"
});

const database = firebase.database();
const guidesRef = database.ref('guides');

// Clear old guides
guidesRef.remove();

// Publish guides on Firebase
removeGuides()
  .then(() => publishGuides())
  .then(() => console.log('Uploaded all guides to firebase.'))
  .then(() => firebaseApp.delete(), (err) => {firebaseApp.delete(); console.error(err)});

/** Removes all guides from Firebase */
function removeGuides() {
  return guidesRef.remove();
}

/** Publishes all guides on Firebase */
function publishGuides() {
  return Promise.all(guides.map(fileName => {
    const canonicalName = basename(fileName).replace(/\.md$/, '').toLocaleLowerCase();
    const fileContent = fs.readFileSync(join(CONTENT_DIR, fileName), 'utf-8');

    const title = readVariable('title', fileContent);
    const group = readVariable('group', fileContent);
    const markedContent = marked(filterVariables(fileContent));

    // Store the guide with a specific canonical name in the firebase database.
    return guidesRef.child(canonicalName).set({
      title: title,
      group: group,
      content: markedContent
    });
  }));
}

/** Read a variable from a file using the annotation symbol. */
function readVariable(variable, input) {
  const matches = new RegExp(`^@${variable} (.+)$`, 'igm').exec(input);
  return matches && matches[1];
}

/** Deletes all variables from a Markdown file. */
function filterVariables(input) {
  return input.replace(new RegExp(`^@(\\w)+ (.+)$`, 'igm'), '');
}

/** Decodes a token from Travis CI */
function decodeToken(token) {
  // In Travis CI the private key will be incorrect because the line-breaks are escaped.
  // The line-breaks need to persist in the service account private key.
  return (token || '').replace(/\\n/g, '\n');
}
