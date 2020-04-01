'use strict';

// Don't run in parallel
const fs = require('fs');
const debug = require('debug')('proxyapp:loader');
const chalk = require('chalk');

var toLoadModules = [];
var availableMeta = [];

function _done(){
  // For counting phases
  var phase = 0;
  // No of retries
  while (phase < 100){
    availableMeta.push('PHASE_' + phase);
    phase++;
    var unchanged = 1;
    while (unchanged < 2){
      var canLoadModules = toLoadModules
        .filter((a) => { return !a.loaded && _canLoadModule(a); });
      // If none in can load modules we are locked
      if (canLoadModules.length === 0){
      // Merge availableMeta to create new metas
        for (let i in availableMeta){
          var i1 = availableMeta[i].indexOf('.');
          if (i1 === -1){
            i1 = availableMeta[i].indexOf('/');
          }
          if (i1 !== -1)
            availableMeta[i] = availableMeta[i].substr(0, i1);
        }
      }

      unchanged += 1;
      for (let i in canLoadModules){
        canLoadModules[i].loaded = true;
        availableMeta = availableMeta.concat(canLoadModules[i][1].gives);
        canLoadModules[i][1].init();
        debug(canLoadModules[i][0], 'loaded');
        unchanged = 0;
      }
    }
  }
  if (!toLoadModules.every((a) => a.loaded)){
    debug('Not all modules are loaded');
    debug('Requires');
    toLoadModules
      .filter(a=>!a.loaded)
      .map(a=>[a[0],a[1].requires.filter(a=>!availableMeta.includes(a))])
      .map(a=>debug(a[0],':',chalk.redBright(a[1])));
    debug('Available')
    debug(availableMeta
            .filter(a=>!a.startsWith('PHASE_'))
            .concat(['PHASE_XX'])
          );
    console.log(chalk.red('Not all modules are loaded'));
  }
}

// Check if all requires are available
function _canLoadModule(mod){
  let check = mod[1].requires.every((req) => availableMeta.includes(req));
  if (!check)
    return false;
  return mod[1].gives.every((a) => {
    let doti = a.indexOf('.');
    if (doti === -1)
      return true;
    return (toLoadModules
      .filter(a => !a.loaded)
      .map(a => a[1].gives)
      .flat()
      .filter(r => {
        let doti2 = r.indexOf('.');
        if ((doti2 !== -1) && (r.substr(0, doti2) === a.substr(0, doti)))
          return r < a;
        else
          return false;
      })
      .length === 0
    );
  });
}

function loadPlugins(dir, files){
  for (let i in files){
    // Index.js must be loaded previously
    var fname = files[i];
    if (fname === 'index.js')
      continue;
    try {
      var meta = require(dir + '/' + fname);
    } catch (e) {
      console.log(e);
      continue;
    }
    // If folder open it
    if (meta.submodules)
      loadPlugins(dir + '/' + fname, meta.submodules);
    // If not init function then no need to load it
    if (!meta.init && typeof (meta.init) !== 'function')
      continue;
    if (!meta.gives)
      meta.gives = [];
    // Folder
    loadPlugins(dir + '/' + fname, meta.submodules);
    // File
    // If not mount point is given mount at last
    if (!meta.requires || meta.requires.length === 0)
      meta.requires = ['PHASE_99'];
    toLoadModules.push([fname, meta]);
  }
}

function loadPluginsFromDir(dir, done = () => {}){
  fs.readdir(dir, (err, files) => {
    if (err){
      console.error(err);
    } else {
      debug('started');
      loadPlugins(dir, files);
      _done();
      toLoadModules = [];
      availableMeta = [];
      debug('completed');
      done();
    }
  });
}

module.exports = loadPluginsFromDir;
