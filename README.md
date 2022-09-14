# i18n-translate-json

Automatically translates node-i18n JSON files into different languages via Microsoft Azure Translator API.

## Installation

First, clone the repository locally. Pack the application and install it globally.
```
npm pack

npm i -g i18n-translate-json-1.1.0.tgz
```

## Usage

You need a Microsoft Azure Translate API Key. The goal is to extend this module to work for other services.

```
i18n-translate-json [apiKey] [locales dir] [source language dir] [output locales]
```

e.g.

```
i18n-translate-json xxxxxxxxxxxxxxxxxxxx ./public/locales en es,ta,te
```

This would translate all strings in `public/locales/en/*.json` (relative to current folder in the shell) from English to Spanish, Tamil, and Telegu based on the Microsoft Azure API language codes.

## Credits

Based on [i18n-translate](https://github.com/thomasbrueggemann/i18n-translate) by Thomas Brüggemann.

This fork is sponsored by [Meedan](http://meedan.com).
