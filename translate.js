var fs = require("fs");
var traverse = require("traverse");
var azure = require("./modules/azure-translate");

var TRANSERR = {
  NOT_TRANSLATED: 1,
};

// RUN
var run = function(apiKey, dir, sourceLanguage, languages, finish) {

  var azu = azure(apiKey);

  // TRANSLATE
  var translate = function(texts, languages, callback) {
    if (apiKey) {
      // fire the microsoft translation
      azu.translate(texts, sourceLanguage, languages, function(err, translations) {
        if (err) {
          return callback(TRANSERR.NOT_TRANSLATED, texts);
        }
        // return the translated text
        return callback(null, translations);
      });
    } else {

      // bypass translation
      return callback(null, texts);
    }
  };

  // PROCESS ONE FILE
  var processFile = function (file, callback) {
    // open file
    fs.readFile(dir + sourceLanguage + "/" + file, function (err, data) {
      // bubble up error
      if (err) {
        return callback(
          {
            file: file,
            error: err,
          },
          null
        );
      }

      data = data.toString();

      var parsed;
      try {
        parsed = JSON.parse(data);
      } catch (e) {
        return callback(
          {
            file: file,
            error: e,
          },
          null
        );
      }

      var traversed = traverse(parsed);

      var targets = {};

      // create targets for every language
      for (var l in languages) {
        var lang = languages[l];
        targets[lang] = traverse(traversed.clone());
      }

      // find all paths of the object keys recursively
      var paths = traversed
        .paths()
        .filter((p) => {
          const val = traversed.get(p);
          return typeof val === "string" && val.length;
        });

        // get the leaves
        var texts = traversed.reduce(function (acc, x) {
          if (this.isLeaf && x?.length) acc.push(x);
          return acc;
        }, []);
      // translate the text
      translate(texts, languages, function (err, results) {
        // add new value to path
        for (var i in results) {
          var path = paths[i];
          var translations = results[i].translations;
          for (var j in translations) {
            var t = translations[j];
            targets[t.to].set(path, t.text);
          }
        }
        var e = null;
        if (err === TRANSERR.NOT_TRANSLATED) {
          e = {
            file: file,
            path: path,
            source: sourceLanguage,
            target: languages,
          };
        }
        // all languages have been translated
        finished(e);
      });

      // all are translated
      var finished = function (err) {
        // write translated targets to files
        for (var t in targets) {
          var transStr = JSON.stringify(targets[t].value, null, "\t");

          var out = dir + t;
          if (!fs.existsSync(out)) fs.mkdirSync(out);

          var p = out + "/" + file;
          fs.writeFileSync(p, transStr);
          // add language to source file
          parsed[t] = true;
        }

        // spice up error message
        if (err) {
          err = {
            file: file,
            error: err,
          };
        }
      };
    });
  };
  
  // process the source files
  fs.readdir(dir + '/' + sourceLanguage, function(err, files) {
    if (err) {
      process.exit(0);
    }

    for (var i in files) {
      processFile(files[i]);
    }
  });
};

// EXPORTS
module.exports = {
  "run": run
}
