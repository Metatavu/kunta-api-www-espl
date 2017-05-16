(function () {
  'use strict';

  $(document).ready(function () {
    
    $('.social-media-items').css('opacity', '0');

    $('.social-media-items').imagesLoaded(function () {
      $('.social-media-items')
        .css('opacity', '1')
        .masonry({
          itemSelector: '.social-media-item',
          columnWidth: '.social-media-items-grid-sizer',
          percentPosition: true
        });
    });

  });
  
  
    $(window).on('load', function(){
      $('.contact-image').mapster({
        stroke: false,
        fillColor: 'ffffff',
        fillOpacity: 0.2,
        highlight: true,
        isSelectable: false,
        clickNavigate: true,
        mapKey: 'id'
      });
      
      $(window).resize(function () {
        var width = $('.banner-contacts').width()
        $('.contact-image').mapster('resize',width);
      });
      
    });
  
}).call(this);