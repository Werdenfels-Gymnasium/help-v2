'use strict';

const {join} = require('path');
const marked = require('marked');
const glob = require('glob').sync;
const fs = require('fs');

const PROJECT_DIR = join(__dirname, '..');
const CONTENT_DIR = join(PROJECT_DIR, 'src/assets/guides');

const guides = glob('**/*.md', {cwd: CONTENT_DIR});

guides.forEach(fileName => {
	const fileContent = fs.readFileSync(join(CONTENT_DIR, fileName), 'utf-8');

  console.log(marked(fileContent));
})
