/*--------------------------------------------------
Website by Websolute
--------------------------------------------------*/
'use strict';


(function ($) {

  var body = $('body'),
    header = $('.header'),
    html = document.documentElement,
    isSafari = /constructor/i.test(window.HTMLElement) || (function (p) {
      return p.toString() === "[object SafariRemoteNotification]";
    })(!window['safari'] || safari.pushNotification),
    isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
    isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./),
    isMobile = false;

  function oldBrowsers() {
    if (isIE11 === true) {
      html.classList.add('msie');
    }
    if (isSafari === true) {
      html.classList.add('safari');
    }
  }

  //OverScroll
  function getOverScrolls() {

    var windowRect = {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    };

    var OverScroll = function (element) {
      this.element = element;
      this.image = element.querySelector(element.getAttribute('image'));
      this.image.onload = this.onload.bind(this);
      this.source = element.getAttribute('source') || 'assets/img/hero/cover_alpha_{frame}.{ext}';
      this.totalFrames = 100;
      this.rect = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      };
      this.intersection = {
        x: 0,
        y: 0
      };
      // this.preload();
    };

    OverScroll.prototype.preload = function () {
      var count = 0,
        totalFrames = this.totalFrames,
        getSrc = this.getSrc;

      var next = function () {
        var image = new Image();
        var onload = function () {
          if (count < totalFrames) {
            count++;
            next();
          }
        }.bind(this);
        image.onload = onload;
        image.src = this.getSrc(count + 1);
      }.bind(this);

      next();
    };

    OverScroll.prototype.setFrame = function (frame) {
      this.frame = frame = 1 + Math.floor(frame / 2) * 2;
      if (!this.busy && this.currentFrame !== frame) {
        if (this.currentFrame === undefined) {
          this.currentFrame = frame;
        }
        var nextFrame = frame;
        /*
        this.busy = true;
        if (frame > this.currentFrame) {
          nextFrame = this.currentFrame + 2;
        } else if (frame < this.currentFrame) {
          nextFrame = this.currentFrame - 2;
        }
        */
        this.currentFrame = nextFrame;
        // var src = this.getSrc(nextFrame);
        // this.image.src = src;
        var width = this.image.parentNode.getBoundingClientRect().width;
        var offset = Math.min(49, Math.floor(frame / 2));
        // console.log(width, offset, (-width * offset));
        this.image.style.transform = 'translate3d(' + (-width * offset) + 'px,0,0)';
      }
    };

    OverScroll.prototype.onload = function () {
      this.busy = false;
      this.setFrame(this.frame);
    };

    OverScroll.prototype.scroll = function (scrollY) {
      var element = this.element;
      var boundingRect = element.getBoundingClientRect();
      var rect = this.rect;
      rect.top = boundingRect.top - window.innerHeight / 2 + boundingRect.height / 2;
      rect.left = boundingRect.left;
      rect.width = boundingRect.width;
      rect.height = boundingRect.height;
      windowRect.width = window.innerWidth;
      windowRect.height = window.innerHeight;
      var intersection = this.getIntersection(rect, windowRect);
      var frame = 1 + Math.round(intersection.y * (this.totalFrames - 1));
      this.setFrame(frame);
    };

    OverScroll.prototype.getIntersection = function (aRect, bRect) {
      var dx = aRect.left > bRect.left ? 0 : Math.abs(bRect.left - aRect.left);
      var dy = aRect.top > bRect.top ? 0 : Math.abs(bRect.top - aRect.top);
      var x = dx ? (1 - dx / aRect.width) : ((bRect.left + bRect.width) - aRect.left) / aRect.width;
      var y = dy ? (1 - dy / aRect.height) : ((bRect.top + bRect.height) - aRect.top) / aRect.height;
      this.intersection.x = 1 - Math.max(0, Math.min(1, x));
      this.intersection.y = 1 - Math.max(0, Math.min(1, y));
      return this.intersection;
    };

    OverScroll.prototype.getSrc = function (frame) {
      // return this.source.replace('{frame}', this.pad(frame, 4)).replace('{ext}', (isSafari || isIOS) ? 'jp2' : 'webp');
      return this.source.replace('{frame}', this.pad(frame, 4)).replace('{ext}', 'jpg');
    };

    OverScroll.prototype.pad = function (value, num) {
      value = value.toString();
      return value.length < num ? this.pad('0' + value, num) : value;
    };

    var overScrolls = Array.prototype.slice.call(document.querySelectorAll('[overscroll]')).map(function (element) {
      return new OverScroll(element);
    });

    overScrolls.scroll = function (scrollY) {
      for (var i = 0; i < overScrolls.length; i++) {
        overScrolls[i].scroll(scrollY);
      }
    };

    return overScrolls;

  }

  //Page Scroll
  function pageScroll() {

    var PageScroll = function (options) {
      this.opt = options || {};
      this.el = this.opt.el ? this.opt.el : '.page-scroll';
      this.speed = this.opt.speed ? this.opt.speed : 0.1;
      this.init();
    };

    PageScroll.prototype.init = function () {

      this.supahScroll = document.querySelectorAll(this.el)[0];
      this.events();
      this.resize();
      this.animate();
    };

    PageScroll.prototype.resize = function () {

      document.body.style.height = `${this.supahScroll.getBoundingClientRect().height}px`;
    };

    PageScroll.prototype.animate = function () {
      var y = this.scrollY || 0;
      var scrollY = y + (window.scrollY - y) * this.speed;
      if (this.scrollY === undefined || Math.round((y - scrollY) * 100) !== 0) { // fire changes every 0.01 pixel
        this.scrollY = scrollY;
        this.supahScroll.style.transform = `translate3d(0,${-Math.floor(this.scrollY)}px,0)`;
        this.onScroll(this.scrollY);
      }
      this.raf = requestAnimationFrame(this.animate.bind(this));
    };

    PageScroll.prototype.onScroll = function (scrollY) {}; // noop

    PageScroll.prototype.events = function () {

      window.addEventListener('load', this.resize.bind(this));
      window.addEventListener('resize', this.resize.bind(this));
    };

    var PageScrollEvent = {
      scroll: function (scrollY) {
        if (this.scrollY === undefined || Math.round((this.scrollY - scrollY) * 100) !== 0) { // fire changes every 0.01 pixel
          this.scrollY = scrollY;
          if (typeof this.onScroll === 'function') {
            this.onScroll(scrollY);
          }
        }
      },
    };

    if (!isMobile) {
      var initScroll = new PageScroll({
        el: '.page-scroll',
        speed: 0.17
      });

      initScroll.onScroll = function (scrollY) {
        PageScrollEvent.scroll(scrollY);
      };

      setTimeout(function () {
        initScroll.resize();
      }, 500);
    } else {
      window.addEventListener('scroll', function () {
        var scrollY = window.pageYOffset || window.scrollY || window.scrollTop || 0;
        PageScrollEvent.scroll(scrollY);
      });
    }

    return PageScrollEvent;
  }

  //Anchor Scroll
  function anchorScroll() {

    var element = $('[data-anchor]');

    if (!element || element.length <= 0) return;

    element.on('click', function (e) {
      e.preventDefault();
      var scrollTo = '#' + element.attr('data-anchor');

      $('html, body').animate({
        'scrollTop': $(scrollTo).offset().top - 50
      }, 1000);
    });
  }

  //== Init Plugins
  function init() {

    //Split lib
    Splitting();

    //ScrollOut lib
    ScrollOut({
      once: false,
      onShown: function (el) {
        if (el.classList.contains('video-component')) {
          $(el)[0].play();
        }
      },
      onHidden: function (el) {
        if (el.classList.contains('video-component')) {
          $(el)[0].pause();
        }
      }
    });

    var overScrolls = getOverScrolls();

    //Page Scroll
    var pageScrollEvent = pageScroll();

    pageScrollEvent.onScroll = function (scrollY) {
      overScrolls.scroll(scrollY);
    };

    //Scroller lib
    var scroller = skrollr.init({
      smoothScrollingDuration: 2000,
      forceHeight: false
    });
    scroller.isMobile() ? scroller.destroy() : null;

  }

  //is Mobile
  window.mobileAndTabletCheck = function () {
    (function (a) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
        isMobile = true;
        body.addClass('isMobile');
      }
    })(navigator.userAgent || navigator.vendor || window.opera);
  };

  mobileAndTabletCheck();

  //=== Scroll Event
  window.addEventListener('scroll', function () {

    //Header scroll
    var scroll = $(window).scrollTop();

    if (scroll >= window.innerHeight) {
      header.addClass("header--fixed").addClass("header--enter");
    } else {
      header.removeClass("header--fixed").removeClass("header--enter");
    }

  });

  // === DOC READY ===
  $(function () {

    init();
    oldBrowsers();
    anchorScroll();

  });

})(window.jQuery);
