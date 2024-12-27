#!/usr/bin/env node
/// <reference types="zx" />
import { echo, fs, path, question } from 'zx';
import clipboard from 'clipboardy';
import { isEmpty, isObject, result, lowerFirst } from 'lodash-es';
import json2ts from 'json2ts';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
// pages.searchUser.update
// 当前文件路径 = __filename
const filename = fileURLToPath(import.meta.url);
const INIT_CWD = process.env.INIT_CWD;
const cwd = process.cwd();
const dirname = path.dirname(INIT_CWD);
// checkbox
(async () => {
  let tableItem;
  let clipboardStr = clipboard.readSync();
  try {
    tableItem = JSON.parse(clipboardStr);
  } catch (error) {}

  try {
    tableItem = await fs.readJSON(path.resolve(INIT_CWD, 'data.json'));
  } catch (error) {}
  while (!(tableItem && isObject(tableItem) && !isEmpty(tableItem))) {
    try {
      await question('请复制JSON数据到剪切板后回车 ', { choices: ['{"id":1}', '{"id":2}'] });
      tableItem = JSON.parse(clipboard.readSync());
    } catch (error) {
      echo(error);
    }
  }
  const data = await inquirer.prompt([
    { type: 'list', choices: ['true', 'false'], name: 'hideInSearch', message: 'hideInSearch' },
    /* Pass your questions in here */
  ]);
  console.log(data, 'choose data');
  const list = Object.keys(tableItem).map((e) => {
    return `{
    title: FormattedMessage({id:"${lowerFirst(dirname)}.${e}", defaultMessage:"${e}"}),
    dataIndex: '${e}',
   ${data.hideInSearch === 'true' ? `hideInSearch: true,` : ''}
   ${e.endsWith('_at') ? `valueType: 'dateTime',` : ''}
},`;
  });
  let result = json2ts.convert(JSON.stringify(tableItem));
  const outIndex = path.resolve(INIT_CWD, 'index.tsx');
  const outDts = path.resolve(INIT_CWD, 'data.d.ts');
  const outService = path.resolve(INIT_CWD, 'service.ts');
  const dtsContent =
    'export interface Params {}' +
    '\n' +
    result.replace(/export interface RootObject/g, 'export interface ListItem');

  const inputIndex = path.resolve(filename, '..', './tpl/index.tsx');
  const inputDts = path.resolve(filename, '..', './tpl/data.d.ts');
  const inputService = path.resolve(filename, '..', './tpl/service.ts');
  fs.writeFileSync(outDts, dtsContent);
  fs.writeFileSync(
    outIndex,
    fs
      .readFileSync(inputIndex)
      .toString()
      .replace('/** columns */', `${list.join('\n')}`)
      .replace('/** mockdata */', `${JSON.stringify(tableItem, null, 2)}`),
  );

  fs.writeFileSync(
    outService,
    fs.readFileSync(inputService).toString(),
    // .replace("/** columns */", `${list.join('\n')}`)
    // .replace("/** mockdata */", `${JSON.stringify(tableItem, null, 2)}`)
  );
  echo(`success: ${outDts}`);
  echo(`success: ${outIndex}`);
  // $`prettier --write ${outIndex}`
  // $`code ${outIndex}`
  // Object.entries(tableItem).forEach(([key,v])=>{
  //     key === 1
  // })
  // tries = await question('重试次数: ', { choices: '10' });
  // sleep = await question('等待时间(默认单位ms): ', { choices: '10ms' });
  // await retry(formatTries(tries), formatSleep(sleep), () => $`${cmd?.split(/\s+/)}`);
})().catch(echo);
