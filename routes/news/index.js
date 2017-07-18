/*jshint esversion: 6 */
/* global __dirname */

(function() {
  'use strict';

  const util = require('util');
  const moment = require('moment');
  const Common = require(__dirname + '/../common');

  module.exports = (app, config, ModulesClass) => {
    
    app.get('/newsArticleImages/:newsArticleId/:imageId', (req, res, next) => {
      var newsArticleId = req.params.newsArticleId;
      var imageId = req.params.imageId;
      
      if (!newsArticleId || !imageId) {
        next({
          status: 404
        });
        
        return;
      }
      
      new ModulesClass(config)
        .news.streamImageData(newsArticleId, imageId, req.query, req.headers)
        .callback((result) => {
          var stream = result[0];
          
          if (stream) {
            stream.pipe(res);
          } else {
            next({
              status: 500,
              message: "Kuvan lataus epäonnistui"
            });
          }
        });
    });
    
    app.get(util.format('%s/:slug', Common.NEWS_FOLDER), (req, res, next) => {
      var slug = req.params.slug;

      if (!slug) {
        next({
          status: 404
        });
        return;
      }

      new ModulesClass(config)
        .news.latest(0, 10)
        .news.findBySlug(slug)
        .callback(function(data) {
          var newsArticle = data[1];
          var siblings = data[0];
          if (!newsArticle) {
            next({
              status: 404
            });
            return;
          }

          var bannerSrc = '/gfx/layout/default_banner.jpg';
          res.render('pages/news-article.pug', Object.assign(req.kuntaApi.data, {
            id: newsArticle.id,
            slug: newsArticle.slug,
            title: newsArticle.title,
            tags: newsArticle.tags,
            contents: Common.processPageContent('/', newsArticle.contents),
            sidebarContents: Common.getSidebarContent(newsArticle.contents),
            imageSrc: newsArticle.imageId ? util.format('/newsArticleImages/%s/%s', newsArticle.id, newsArticle.imageId) : Common.DEFAULT_NEWS_IMAGE,
            bannerSrc: bannerSrc,
            siblings: siblings,
            breadcrumbs : [{path: util.format('%s/%s', Common.NEWS_FOLDER, newsArticle.slug), title: newsArticle.title }]
          }));

        }, (err) => {
          next({
            status: 500,
            error: err
          });
        });
    });

    app.get(Common.NEWS_FOLDER + '/', (req, res, next) => {
      const perPage = Common.NEWS_COUNT_PAGE;
      const tag = req.query.tag;
      const page = tag ? null : parseInt(req.query.page)||0;
      const module = new ModulesClass(config);
        
      (tag ? module.news.listByTag(tag) : module.news.latest(page * perPage, perPage + 1))
        .callback((data) => {
          const lastPage = data[0].length < perPage + 1;
          const newsArticles = data[0].splice(0, perPage).map(newsArticle => {
            return Object.assign(newsArticle, {
              "shortDate": moment(newsArticle.published).format("D.M.YYYY"),
              "imageSrc": newsArticle.imageId ? util.format('/newsArticleImages/%s/%s', newsArticle.id, newsArticle.imageId) : Common.DEFAULT_NEWS_IMAGE_THUMB
            });
          });
          const bannerSrc = '/gfx/layout/default_banner.jpg';
          
          res.render('pages/news-list.pug', Object.assign(req.kuntaApi.data, {
            page: page,
            lastPage: lastPage,
            newsArticles: newsArticles,
            tag: tag,
            bannerSrc: bannerSrc,
            breadcrumbs : [{path: util.format('%s/?tag=%s', Common.NEWS_FOLDER, tag), title: tag ? util.format("Uutiset tagilla '%s'", tag) : 'Uutiset'}]
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