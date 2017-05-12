/*jshint esversion: 6 */
(function() {
  'use strict';
  
  module.exports = (app, config, ModulesClass) => {

    app.get('/incidents', (req, res, next) => {
      new ModulesClass(config)
        .incidents.list(new Date())
        .callback((result) => {
          if (result && result.length) {
            res.send(result[0]);
          } else {
            next({
              status: 404
            });
          }
        });
    });
    
  };

}).call(this);