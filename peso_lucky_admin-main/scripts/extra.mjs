#!/usr/bin/env node
/// <reference types="zx" />
import { echo, fs, path, question, glob } from 'zx';
import clipboard from 'clipboardy';
import { isEmpty, isObject, result, union, lowerCase, upperFirst } from 'lodash-es';
import json2ts from 'json2ts';
import { fileURLToPath } from 'url';
// import zhCN from '../src/locales/zh-CN.json' assert { type: "json" };
// import zhCN from '../src/locales/zh-CN'
// const zhCN = require('../src/locales/zh-CN.ts',)
// 当前文件路径 = __filename
const filename = fileURLToPath(import.meta.url);
const INIT_CWD = process.env.INIT_CWD;
const cwd = process.cwd();
const dirname = path.dirname(INIT_CWD);
const readTsJson = () => {
    const file = fs.readFileSync(cwd + '/src/locales/zh-CN.ts').toString()
    return eval(file.replace('export default', `(function name(){
    return`) + '})()')
}
const zhCN = readTsJson('/src/locales/zh-CN.ts');
(async () => {
    const files = await glob(INIT_CWD + '**/*.tsx');
    let res = []
    console.log(files)
    for (const file of files) {
        const content = fs.readFileSync(file).toString();
        const match = content.match(/id="(.*?)"/g);
        // 'id="merchant.merchant_name"' => merchant.merchant_name
        match && res.push(...match.map(e => e.replace(/id="|"/g, '')))
        res = res.filter(v => !(v in zhCN))
        res = union(res)

        const match2 = content.match(/id: '(.*?)'/g);
        // 'id="merchant.merchant_name"' => merchant.merchant_name
        match2 && res.push(...match2.map(e => e.replace(/id: '|'/g, '')))
        res = res.filter(v => !(v in zhCN))
        res = union(res)
    }
    let s = ''
    for (const v of res) {
        s += `${v}\t\t${upperFirst(lowerCase(v.split('.').pop()))}\r\n`
    }

    console.log(s)
    clipboard.writeSync(s)
    // console.log((res))
})().catch(echo);