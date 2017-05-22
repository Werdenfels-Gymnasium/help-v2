'use strict';

const {join} = require('path');
const marked = require('marked');
const glob = require('glob').sync;
const fs = require('fs');
const firebase = require('firebase-admin');

const PROJECT_DIR = join(__dirname, '..');
const CONTENT_DIR = join(PROJECT_DIR, 'src/assets/guides');

const guides = glob('**/*.md', {cwd: CONTENT_DIR});

const firebaseApp = firebase.initializeApp({
  credential: firebase.credential.cert({
    project_id: "help-v2-e856d",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC8NCbd013QdviA\nCjcz7334eHLGw5AGRvW00xdxtDVsSBfaEe4UuKkrYO6SWfsRAzfgOCApSGXbUngF\nyhBK61UfJniu2rtXf77MZSWc74lcm+pl7p7HMIn1QMV7oDeL5qrIoZGE4bEjQS7n\nn+Lv3iwC9ge7u2+/W8qRWxHlfC3ODAV4wPL+EydXCCLes6mBrk6xb9QQQLr06D/x\nZNgTXkJe/KDvEvPijTHuaaT6ifGlW81/VxExEtF0ZLMe4KkFhXUrlKkxFbBnwgQp\n4fzKpI8wob0gsrHwFvzexKHjLIQr8+7UY/PQi36bcnJ1u/lk2VT9I5niwsXQHFdN\nbMYi1C6HAgMBAAECggEAHbUaY3kkkwOMiI1+7DmZXU9fSAUA5soW/nLe/amP+zvK\nrrdA06WDEoqrmI9lLujJTkvIYSvWjs75jL8PYPwSWic/n9N9WeZGDvZyVaTb6Qc1\ncd8/fJAACXtZZivCni3hdxJF1D9Z2jJE/faCIxHN9FkInHdi6sZJoeB0YTsqRx6J\n/ce5USMZTGK4vmd7s6GDl7SJRWpGV1Ny4qS54mhTioDX/IZDT3YNgKTr41EJSUaO\nqr22OnlrRuRbrUCorZNqeWuzu91mCJjP3Du/25mvxfdEVPFIL7AjGrHSjsnEdNfk\nTmiRfBJnJyY+pFfYLGIdaYav6VnNm6dCWh4yal3FlQKBgQDzbS3aM69GOLItPpzT\nnDgFcanufWo44hdwcPPmMc/sJGMpJJLawTvsj5DWQvYb8/RcF6RmIGYOFUsOnmt1\nWX6/62c5oHDKhtW2btYzpT9mFPksE/XnNyGmUwVisCcdZulLRCdMYWOcyyKgBVZq\nTyXpzzEvrk1/zXpBzsr/Hzr5DQKBgQDF7MOJN9N4zKNpzbuf/9pn0oJeLGkPR49j\nNlOKf6YeoJy20NVe98iZqTVWq1ikb2//neAezgQe8nA6u1rT56WVm57ItYR6bcKU\n80z7jwiMoqNZnb70O0uLRuQszTJzZ3yJKvXRw5X9qi8SJJxE7QCBY+aCVxgO18NK\nKrTilqi44wKBgAThcYPoeWEtDdV+ZeKQRUdGqiOP/Cs7zUCB40IASazwZdSTWSZt\nrWfm0P6axRh2YbXe+3rYt3Mc1i5q2ri1nKb4b09mehx1a5+GxWCvtX+0d/J8S/fg\n0RnmnDsIUSBzycWqjicn5LlmEUGoGb1z7MytTM0p73/afNMI9GT9GU+ZAoGAMRsh\nGHZlXV9IXAPTPUs5YPD1r2/NUSEsDi14ZLBvAsJOn30Is1s+xgEZXrt8bq/HVeBR\nrtLmatczyR6a1mBu0MOfjaSbjdSVpmcG/pLqSBpB9QYSTn43rAKWshbnIYLXfyDN\nhJHGMP18WEAFFYTHz1J96nC5Y1Vc+pXF80H18okCgYBA6mWWVMHYeVMoVly+cZkq\nw+JNM1GIWUwYqcccuSrjIRluopw1FDraIAgBcp2vpd8ryX9rockcivLvDpyQRBeg\nAOFF6ccLm/fEcipgrBn/VezGnu4z7UkisR7gbGG/OXmg6ZdDgcJEvB8eeOIRlTW4\nPkj0ulIF5BacqYDoAJmXoA==\n-----END PRIVATE KEY-----\n",
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
  .then(() => firebaseApp.delete(), () => firebaseApp.delete());

/** Removes all guides from Firebase */
function removeGuides() {
  return guidesRef.remove();
}

/** Publishes all guides on Firebase */
function publishGuides() {
  return Promise.all(guides.map(fileName => {
    const canonicalName = fileName.replace(/\//, '-').replace(/\.md$/, '').toLocaleLowerCase();
    const fileContent = fs.readFileSync(join(CONTENT_DIR, fileName), 'utf-8');
    const markedContent = marked(fileContent);

    // Store the guide with a specific canonical name in the firebase database.
    return guidesRef.child(canonicalName).set(markedContent);
  }));
}
