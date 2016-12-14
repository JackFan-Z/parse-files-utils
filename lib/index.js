var Parse = require('parse/node');
var inquirer = require('inquirer');

var schemas = require('./schemas');
var transfer = require('./transfer');
var questions = require('./questions.js');
var fs = require('fs');

module.exports = initialize;

var currentConfig;
function initialize(config) {
  if (process.argv.length > 2) {
    config.configFilename = process.argv[2]; 
  }
  questions(config).then(function (answers) {
    config = Object.assign(config, answers);
    currentConfig = config;
    console.log(JSON.stringify(config, null, 2));
    return inquirer.prompt({
      type: 'confirm',
      name: 'next',
      message: 'About to start the file transfer. Does the above look correct?',
      default: true,
    });
  }).then(function(answers) {
    if (!answers.next) {
      console.log('Aborted!');
      process.exit();
    }
    Parse.initialize(config.applicationId, null, config.masterKey);
    Parse.serverURL = config.serverURL;
    return transfer.init(config);
  }).then(function() {
    return getAllFileObjects();
  }).then(function(objects) {
    return transfer.run(objects);
  }).then(function(theLastUpdatedAt) {
    console.log('--> Complete!');
    if (currentConfig.updatedAt_greaterThan_autoUpdateWhenComplete == true) {
      console.log('    Automatically update ' + config.configFilename + ' ...');
      var data = fs.readFileSync(config.configFilename, 'utf-8');
      var newValue = data.replace(/updatedAt_greaterThan.*\n/, 'updatedAt_greaterThan: "' + theLastUpdatedAt + '", // ' + currentConfig.updatedAt_greaterThan + '\n');
      fs.writeFileSync(config.configFilename, newValue, 'utf-8');
      console.log('       "updatedAt_greaterThan":' + theLastUpdatedAt);
    }
    process.exit();
  }).catch(function(error) {
    console.log(error);
    process.exit(1);
  });
}

function getAllFileObjects() {
  console.log("Fetching schema...");
  return schemas.get().then(function(res){
    console.log("Fetching all objects with files...");
    var schemasWithFiles = onlyFiles(res);
    return Promise.all(schemasWithFiles.map(getObjectsWithFilesFromSchema));
  }).then(function(results) {
    var files = results.reduce(function(c, r) {
      return c.concat(r);
    }, []).filter(function(file) {
      return file.fileName !== 'DELETE';
    });

    return Promise.resolve(files);
  });
}

function onlyFiles(schemas) {
  return schemas.map(function(schema) {
     var fileFields = Object.keys(schema.fields).filter(function(key){
       var value = schema.fields[key];
       return value.type == "File";
     });
     if (fileFields.length > 0) {
       return {
         className: schema.className,
         fields: fileFields
       }
     }
  }).filter(function(s){ return s != undefined })
}

function getAllObjects(baseQuery)  {
  var allObjects = [];
  var next = function() {
    if (allObjects.length) {
      baseQuery.greaterThan('updatedAt', allObjects[allObjects.length-1].updatedAt);
    }
    return baseQuery.find({useMasterKey: true}).then(function(r){
      allObjects = allObjects.concat(r);
      if (r.length == 0) {
        return Promise.resolve(allObjects);
      } else {
        return next();
      }
    });
  }
  return next();
}

function getObjectsWithFilesFromSchema(schema) {
  var query = new Parse.Query(schema.className);
  if (currentConfig.updatedAt_greaterThan) {
    var d1 = new Date(currentConfig.updatedAt_greaterThan);
    query.greaterThan("updatedAt", d1);
  }
  if (currentConfig.updatedAt_lessThan) {
    var d2 = new Date(currentConfig.updatedAt_lessThan);
    query.lessThan("updatedAt", d2);
  }
  query.select(schema.fields.concat('updatedAt'));
  query.ascending('updatedAt');
  query.limit(1000);

  var checks = schema.fields.map(function(field) {
      return new Parse.Query(schema.className).exists(field);
  });
  query._orQuery(checks);

  return getAllObjects(query).then(function(results) {
    return results.reduce(function(current, result){
      return current.concat(
        schema.fields.map(function(field){
          var fName = result.get(field) ? result.get(field).name() : 'DELETE';
          var fUrl = result.get(field) ? result.get(field).url() : 'DELETE';
          return {
            className: schema.className,
            objectId: result.id,
            updatedAt: result.get('updatedAt').toISOString(),
            fieldName: field,
            fileName: fName,
            url: fUrl
          }
        })
      );
    }, []);
  });
}
