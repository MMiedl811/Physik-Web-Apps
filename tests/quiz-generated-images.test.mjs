import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../Quizzes/index.html',import.meta.url),'utf8');
const json=html.match(/<script id="question-data" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
assert.ok(json,'question data present');
const questions=JSON.parse(json);
assert.equal(questions.length,48,'48 questions preserved');
assert.equal(new Set(questions.map(q=>q.id)).size,48,'question IDs unique');
for(const name of ['hero','speed','acceleration','forces','spring']){
  const file=new URL(`../Quizzes/assets/${name}.webp`,import.meta.url);
  assert.ok(fs.statSync(file).size>50000,`${name} generated image non-empty`);
  assert.ok(html.includes(`assets/${name}.webp`),`${name} referenced`);
}
for(const token of ['function topicScene','id="topic-scene"','class="start-art"'])assert.ok(html.includes(token),`${token} present`);
console.log('Quiz visuals OK: 48 questions, 5 generated images.');
