/*jshint esversion: 6 */
/* global __dirname */

(function() {
  'use strict';

  const util = require('util');
  const moment = require('moment');
  const _ = require('lodash');
  const Common = require(__dirname + '/../common');

  module.exports = (app, config, ModulesClass) => {
    
    app.get('/', (req, res, next) => {
      const today = new Date();
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(today.getDate() + 5);

      new ModulesClass(config)
        .news.latest(0, 3)
        .banners.list()
        .socialMedia.latest(Common.SOCIAL_MEDIA_POSTS)
        .emergencies.list("START", "DESC", Common.EMERGENCY_COUNT)
        .environmentalWarnings.list("START", "DESC", null, fiveDaysFromNow, new Date(), null)
        .callback(function(data) {

          var news = _.clone(data[0]).map(newsArticle => {
            return Object.assign(newsArticle, {
              "shortDate": moment(newsArticle.published).format("D.M.YYYY"),
              "imageSrc": newsArticle.imageId ? util.format('/newsArticleImages/%s/%s', newsArticle.id, newsArticle.imageId) : Common.DEFAULT_NEWS_IMAGE_THUMB
            });
          });
          
          var banners = _.clone(data[1] || []).map(banner => {
            var styles = [];
            
            if (banner.textColor) {
              styles.push(util.format('color: %s', banner.textColor));
            }

            if (banner.backgroundColor) {
              styles.push(util.format('background-color: %s', banner.backgroundColor));
            }
            
            return Object.assign(banner, {
              imageSrc: banner.imageId ? util.format('/bannerImages/%s/%s', banner.id, banner.imageId) : '/gfx/layout/default_banner.jpg',
              style: styles.join(';')
            });
          });

          var socialMediaItems = _.clone(data[2] || []).map(socialMediaItem => {
            return Object.assign(socialMediaItem, {
              "shortDate": moment(socialMediaItem.created).format("D.M.YYYY HH:mm")
            });
          });

          var emergencies = _.clone(data[3] || []).map(emergency => {
            return Object.assign(emergency, {
              "shortDate": moment(emergency.time).format("D.M.YYYY HH:mm")
            });
          });

          var environmentalWarnings = _.clone(data[4] || []).map(environmentalWarning => {
            const fiObjectIndex = _.findIndex(environmentalWarning.description, function(description) { 
              return description.language == 'fi'; 
            });

            const fiObject = environmentalWarning.description[fiObjectIndex];

            return {
              "id": environmentalWarning.id,
              "fi": {
                "header": fiObject.value.substr(0, fiObject.value.indexOf(':')),
                "text": fiObject.value.substr(fiObject.value.indexOf(':') + 1)
              }
            };
          });
          
          res.render('pages/index.pug', Object.assign(req.kuntaApi.data, {
            banners: banners,
            socialMediaItems: socialMediaItems,
            news: news,
            emergencies: emergencies,
            environmentalWarnings: environmentalWarnings
          }));

        }, (err) => {
          next({
            status: 500,
            error: err
          });
        });
    });
  };

}).call(this);