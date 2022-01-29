# extract-i18n-key-webpack-plugin
过滤项目中存在的多余i18n key

## 参数说明

- createFile 

true|false

是否在本地创建文件快照

- targetFilePath 

如果创建快照，输入的文件路径

```
em: "src/xxx/xxx.js"
```
- projectType

项目类型，可分为 walle, must 

- i18nProjectName

多语言应用名称

- waitHandleFileList

待处理的文件List

```
em: 
  'src/i18n/strings/zh-CN.json',
  'src/i18n/strings/en-US.json',
  'src/i18n/strings/ko-KR.json',
  'src/i18n/strings/ru-RU.json',
  'src/i18n/strings/ja-JP.json',
```