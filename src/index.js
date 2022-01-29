/**
 *  1. 抽取项目中所有正在使用的i18n key, 去除没使用的i18n
 *  2. 替换i18n key 缩短文件大小
 *  减小i18n文件体积
 */
const fs = require('fs');

const pluginName = 'ExtractI18nKeyWebpackPlugin';
const targetJsPattern = /^js\/.+\.js$/gi; // 目标js文件
// const p1 = /\.get\(\{(\n|\s)*id:(\n|\s)*((\'|\"|\.|\w|\-)+)/gi;
// const p2 = /(id:|key:)(\n|\s)*(\'|\"|\.|\w|\-)+/g;
// const p3 = /('|'')\n*(\w|-)*[^,]*/gi;
// const p4 = /[\w|\-|\.]+/gi;

class ExtractI18nKeyWebpackPlugin {
  constructor(options) {
    this.options = options;
    this.targetKeysList = [];
  }

  writeChangeFile(fileContent, filePath) {
    fs.writeFileSync(filePath, fileContent, (err) => {
      if (err) {
        console.log(err);
        console.log(`${filePath}文件写入失败！`);
        throw err;
      }
    });
  }

  // must应用
  handleFileContentForMust(compilation) {
    let sourceString = '';
    const _this = this;
    const { i18nProjectName } = this.options;
    const pattern_str = new RegExp(
      `(("|')key("|'):|id:)(\\n|\\s)*('|")${i18nProjectName}(\\.|\\w|\\-)+`,
      'g'
    );
    const pattern_str02 = new RegExp(`${i18nProjectName}(\\w|-|\\.)*`, 'g');
    compilation.chunks.forEach(function (chunk) {
      chunk.files.forEach(function (filename) {
        // compilation.assets 存放当前所有即将输出的资源
        // 调用一个输出资源的 source() 方法能获取到输出资源的内容
        if (filename && targetJsPattern.test(filename)) {
          sourceString = compilation.assets[filename].source();
          let _temArr = sourceString.match(pattern_str);
          Array.isArray(_temArr) &&
            _temArr.forEach((item) => {
              let targetItem = item.match(pattern_str02);
              if (
                targetItem &&
                targetItem[0] &&
                !_this.targetKeysList.includes(targetItem[0])
              ) {
                _this.targetKeysList.push(targetItem[0]);
              }
            });
        }
      });
    });
  }

  editCurrentI18nFileContent(compilation) {
    const { waitHandleFileList } = this.options;
    const targetKeysList = this.targetKeysList;
    if (Array.isArray(waitHandleFileList) && waitHandleFileList.length > 0) {
      waitHandleFileList.forEach((itemFile) => {
        const filePath = `${compilation.compiler.context}/${itemFile}`;
        fs.access(filePath, (err) => {
          if (err && err.code === 'ENOENT') {
            console.error(`${itemFile} 文件不存在！`);
            return;
          }
          const JSON_CONTENT = require(filePath);
          let changeFile = false;
          Object.keys(JSON_CONTENT).forEach((item) => {
            if (!targetKeysList.includes(item)) {
              delete JSON_CONTENT[item];
              changeFile = true;
            }
          });
          changeFile &&
            this.writeChangeFile(
              JSON.stringify(JSON_CONTENT, '', '\t'),
              filePath
            );
        });
      });
    }
  }

  createKeyListFile(compilation) {
    const { targetFilePath } = this.options;
    const _data = JSON.stringify(this.targetKeysList, '', '\t');
    const filePath = `${compilation.compiler.context}/${targetFilePath}`;

    fs.writeFileSync(filePath, _data, { flag: 'w' }, (err) => {
      if (err) {
        console.log(err);
        console.log(`${filePath}写入失败！`);
        throw err;
      }
    });
  }

  apply(compiler) {
    const { createFile, projectType } = this.options;

    compiler.hooks.emit.tapAsync(pluginName, async (compilation, callback) => {
      if (projectType === 'must') {
        // must应用
        this.handleFileContentForMust(compilation);
      }
      callback();
    });

    compiler.hooks.afterEmit.tapAsync(
      pluginName,
      async (compilation, callback) => {
        this.editCurrentI18nFileContent(compilation);
        createFile && this.createKeyListFile(compilation);
        callback();
      }
    );
  }
}

module.exports = ExtractI18nKeyWebpackPlugin;
