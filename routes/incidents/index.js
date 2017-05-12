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
    
    app.get('/incidents', (req, res, next) => {
      const area = req.query.area;
      
      new ModulesClass(config)
        .incidents.list(new Date())
        .callback((result) => {
          let incidents = result[0];
          
          if (result && result.length) {
            if (area) {
              incidents = _.filter(incidents, (incident) => {
                return incident.areas.includes(area);
              });
            }
            
            res
              .header('Access-Control-Allow-Origin', '*')
              .header('Access-Control-Allow-Methods', 'GET, OPTIONS')
              .header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
              .send(incidents);
          } else {
            next({
              status: 404
            });
          }
        });
    });
    
  };

}).call(this);