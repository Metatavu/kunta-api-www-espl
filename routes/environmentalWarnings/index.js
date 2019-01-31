/*jshint esversion: 6 */
(function() {
  'use strict';
  
  const _ = require('lodash');
  
  module.exports = (app, config, ModulesClass) => {
    
    app.options('/incidents', (req, res, next) => {
      res
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Allow-Methods', 'GET,OPTIONS')
        .header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
        .status(204)
        .send();
    });
    
    app.get('/environmentalWarnings', (req, res, next) => {
      const orderBy = req.query.orderBy;
      const orderDir = req.query.orderDir;
      const maxResults = req.query.maxResults;
      const startBefore = req.query.startBefore;
      const startAfter = req.query.startAfter;
      const contexts = req.query.contexts;
      
      new ModulesClass(config)
        .environmentalWarnings.list(orderBy, orderDir, maxResults, startBefore, startAfter, contexts)
        .callback((result) => {
          let environmentalWarnings = result[0];
          
          if (result && result.length) {
            res
              .header('Access-Control-Allow-Origin', '*')
              .header('Access-Control-Allow-Methods', 'GET, OPTIONS')
              .header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
              .send(environmentalWarnings);
          } else {
            next({
              status: 404
            });
          }
        });
    });
    
  };

}).call(this);