$(document).ready(function() {
    //消息关闭
    $(".zui-alert .close").click(function(){
      $(".close").parent().hide();
      $(this).hide();
    });
    // 收缩菜单
    $('.zui-inactive-off').click(function(){
        if($(this).siblings('ul').css('display')=='none'){
            $(this).parent('li').siblings('li').removeClass('zui-inactive-on');
            $(this).addClass('zui-inactive-on');
            $(this).siblings('ul').slideDown(100).children('li');
            if($(this).parents('li').siblings('li').children('ul').css('display')=='block'){
                $(this).parents('li').siblings('li').children('ul').parent('li').children('a').removeClass('zui-inactive-on');
                $(this).parents('li').siblings('li').children('ul').slideUp(100);
            }
        }else{
            //控制自身变成+号
            $(this).removeClass('zui-inactive-on');
            //控制自身菜单下子菜单隐藏
            $(this).siblings('ul').slideUp(100);
            //控制自身子菜单变成+号
            $(this).siblings('ul').children('li').children('ul').parent('li').children('a').addClass('zui-inactive-on');
            //控制自身菜单下子菜单隐藏
            $(this).siblings('ul').children('li').children('ul').slideUp(100);
            //控制同级菜单只保持一个是展开的（-号显示）
            $(this).siblings('ul').children('li').children('a').removeClass('zui-inactive-on');
        }
    });
    // TAB切换
    $(".zui-tab ul li").click(function() {
        var s = $(this).parent().children().index(this); //寻找父级下子元素第几个
        $(this).parent().children().removeClass("zui-active"); //寻找父级下子元素的zui-active Css样式
        $(this).addClass("zui-active")
        $(this).parent().parent().next()
        .children().hide(80)
        .eq(s).show(80); //s元素显示
    });
});

(function (factory) {
    if (typeof define === 'function' && define.amd) {

        define(['jquery'], factory);
    } else if (typeof exports === 'object') {

        factory(require('jquery'));
    } else {

        factory(jQuery);
    }
}(function ($) {

    function Slidizle(item, options) {

        this.settings = {

            classes : {

                content                 : 'zui-carousel-content',

                next                    : 'zui-carousel-next',

                previous                : 'zui-carousel-prev',

                beforeActive            : 'before-active',

                afterActive             : 'after-active',

                nextActive              : 'next',

                previousActive          : 'previous',

                forward                 : 'zui-forward',

                backward                : 'zui-backward',

                navigation              : 'zui-carousel-navigation',

                timer                   : 'zui-carousel-timer',

                slide                   : 'slidizle-slide',

                disabled                : 'zui-disabled',

                first                   : 'first',


                last                    : 'last',

                play                    : 'played',

                pause                   : 'paused',

                stop                    : 'stoped',

                slider                  : 'zui-carousel',

                active                  : 'zui-active',

                loading                 : 'zui-loading'
            },

            timeout                 : null,

            pauseOnHover                : false,

            nextOnClick                 : false,

            loop                    : false,

            autoPlay                : true,

            keyboardEnabled             : true,

            touchEnabled                : true,

            loadBeforeTransition            : true,

            disabled                : false,

            onInit                  : null,

            onClick                 : null,

            beforeChange                : null,

            onChange                : null,

            afterChange                 : null,

            beforeLoading               : null,

            onLoading               : null,

            afterLoading                : null,

            onNext                  : null,

            onPrevious              : null,

            onPlay                  : null,

            onPause             : null,

            onResume                : null
        };
        this.$refs = {
            slider                  : null,
            content                 : null,
            medias                  : null,
            nextSlide               : null,
            previousSlide           : null,
            currentSlide            : null,
            beforeActiveSlides      : null,
            afterActiveSlides       : null,
            navigation              : null,
            next                    : null,
            previous                : null,
            current                 : null,
            timer                   : null
        };
        this.loadingProgress = 0;
        this.current_timeout_time = 0;
        this._internalTimer = null;
        this.timeout = null;
        this.previous_index = 0;
        this.current_index = 0;
        this.next_index = 0;
        this._previous_active_index = 0;
        this._isPlaying = false;
        this._isPause = false;
        this._isOver = false;
        this.total = 0;
        this.$this = $(item);
        this.clickEvent = navigator.userAgent.match(/mobile/gi) ? 'touchend' : 'click';

        // init :
        this.init($(item), options);

    }


    Slidizle.prototype.init = function(item, options) {

        var _this = this,
            $this = item;

        if (!$this.hasClass(_this.settings.classes.slider)) $this.addClass(_this.settings.classes.slider);

        _this._extendSettings(options);

        _this.$refs.slider = $this;
        _this.$refs.content = $this.find('[zui-data-carousel-content]').filter(function() {
            return $(this).closest('[zui-data-carousel]').get(0) == _this.$this.get(0);
        });
        _this.$refs.navigation = $this.find('[zui-data-carousel-navigation]').filter(function() {
            return $(this).closest('[zui-data-carousel]').get(0) == _this.$this.get(0);
        });;
        _this.$refs.previous = $this.find('[zui-data-carousel-prev]').filter(function() {
            return $(this).closest('[zui-data-carousel]').get(0) == _this.$this.get(0);
        });;
        _this.$refs.next = $this.find('[zui-data-carousel-next]').filter(function() {
            return $(this).closest('[zui-data-carousel]').get(0) == _this.$this.get(0);
        });;
        _this.$refs.timer = $this.find('[zui-data-carousel-timer]').filter(function() {
            return $(this).closest('[zui-data-carousel]').get(0) == _this.$this.get(0);
        });;

        if (_this.$refs.content) _this.$refs.content.addClass(_this.settings.classes.content);
        if (_this.$refs.next) _this.$refs.next.addClass(_this.settings.classes.next);
        if (_this.$refs.previous) _this.$refs.previous.addClass(_this.settings.classes.previous);
        if (_this.$refs.navigation) _this.$refs.navigation.addClass(_this.settings.classes.navigation);
        if (_this.$refs.timer) _this.$refs.timer.addClass(_this.settings.classes.timer);

        var $content_childs = _this.$refs.content.children(':first-child');
        if ($content_childs.length > 0) {
            var content_childs_type = $content_childs[0]['nodeName'].toLowerCase();
            _this.$refs.medias = _this.$refs.content.children(content_childs_type);
        }

        $this.addClass(_this.settings.classes.slider);
        _this.$refs.medias.filter(':first-child').addClass(_this.settings.classes.first);
        _this.$refs.medias.filter(':last-child').addClass(_this.settings.classes.last);


        if (_this.$refs.medias) {

            _this.$refs.medias.addClass(_this.settings.classes.slide);

            _this.$refs.medias.bind(_this.clickEvent, function(e) {
                $this.trigger('slidizle.click',[_this]);
                if (_this.settings.onClick) _this.settings.onClick(_this);
            });

            _this.total = _this.$refs.medias.length;
            _this.current_index = 0;

            if (_this.$refs.navigation.length>=1) _this._initNavigation();
            _this.initPreviousNextNavigation();

            var $active_slide = _this.$refs.medias.filter('.active:first');
            if ($active_slide.length >= 1) {
                _this.current_index = $active_slide.index();
            }

            _this._updateSlidesRefs();

            if (_this.settings.pauseOnHover) {
                $this.hover(function(e) {
                    _this._isOver = true;
                    _this.pause();
                }, function(e) {
                    _this._isOver = false;
                    _this.resume();
                });
            }

            if (_this.settings.keyboardEnabled && _this.settings.keyboardEnabled != 'false') _this._initKeyboardNavigation();

            if (_this.settings.touchEnabled && navigator.userAgent.match(/mobile/gi)) _this._initTouchNavigation();

            if (_this.settings.autoPlay && _this.$refs.medias.length > 1) _this.play();

            if (_this.settings.nextOnClick)
            {
                _this.$refs.content.bind('click', function() {
                    _this.next();
                });
            }

            if (_this.settings.onInit) _this.settings.onInit(_this);
            $this.trigger('slidizle.init', [_this]);

            _this.$this.addClass(_this.settings.classes.forward);

            _this._changeMedias();

        } else {

            if (_this.settings.onInit) _this.settings.onInit(_this);
            $this.trigger('slidizle.init', [_this]);

        }

    }


    Slidizle.prototype._initNavigation = function()
    {

        var _this = this,
            $this = _this.$this;

        if (!_this.$refs.navigation) return false;

        if (_this.total <= 1) _this.$refs.navigation.hide();

        if (_this.$refs.navigation.children().length <= 0)
        {
            var navigation_type = _this.$refs.navigation[0]['nodeName'].toLowerCase(),
                navigation_children_type = (navigation_type == 'dl') ? 'dt' :
                                            (navigation_type == 'ol') ? 'li' :
                                            (navigation_type == 'ul') ? 'li' :
                                            'div';


            for (var i=0; i<_this.total; i++)
            {

                _this.$refs.navigation.append('<'+navigation_children_type+'>'+(i+1)+'</'+navigation_children_type+'>');
            }
        }


        _this.$refs.navigation.children().bind(_this.clickEvent, function(e) {


            var $nav = $(this),
                slide_id = $nav.attr('zui-data-carousel-slide-id'),
                content_by_slide_id = _this.$refs.medias.filter('[zui-data-carousel-slide-id="'+slide_id+'"]');


            _this.previous_index = _this.current_index;


            if (slide_id && content_by_slide_id)
            {

                var idx = content_by_slide_id.index();


                if (idx != _this.current_index)
                {

                    _this.current_index = idx;


                    _this._changeMedias();
                }
            } else {

                if ($(this).index() != _this.current_index)
                {

                    _this.current_index = $(this).index();


                    _this._changeMedias();
                }
            }


            e.preventDefault();
        });
    }


    Slidizle.prototype._initKeyboardNavigation = function()
    {

        var _this = this,
            $this = _this.$this;


        $(document).bind('keyup', function(e) {


            switch (e.keyCode)
            {
                case 39:
                    _this.next();
                break;
                case 37:
                    _this.previous();
                break;
            }

        });
    }


    Slidizle.prototype._initTouchNavigation = function()
    {

        var _this = this,
            $this = _this.$this,
            xStart, yStart;


        $(document).bind('touchstart', function(e) {
            xStart = e.originalEvent.touches[0].clientX;
            yStart = e.originalEvent.touches[0].clientY;
        });
        $(document).bind('touchmove', function(e) {
            if ( ! xStart || ! yStart) return;
            var x = e.originalEvent.touches[0].clientX,
                y = e.originalEvent.touches[0].clientY,
                xDiff = xStart - x,
                yDiff = yStart - y;


            if (Math.abs(xDiff) > Math.abs(yDiff))
            {
                if (xDiff > 0)
                {
                    _this.next();
                } else {
                    _this.previous();
                }
            }


            xStart = yStart = null;
        });
    }


    Slidizle.prototype.initPreviousNextNavigation = function()
    {

        var _this = this,
            $this = _this.$this;

        if (_this.$refs.previous)
        {

            if (_this.total > 1) _this.$refs.previous.bind(_this.clickEvent, function() { _this.previous(); });

            if (_this.total <= 1) _this.$refs.previous.hide();
        }


        if (_this.$refs.next)
        {

            if (_this.total > 1) _this.$refs.next.bind(_this.clickEvent, function() { _this.next(); });

            if (_this.total <= 1) _this.$refs.next.hide();
        }
    }


    Slidizle.prototype._pauseTimer = function() {


        var _this = this;


        clearInterval(_this._internalTimer);
    };


    Slidizle.prototype._stopTimer = function() {


        var _this = this;


        clearInterval(_this._internalTimer);


        _this._resetTimer();
    };


    Slidizle.prototype._resetTimer = function() {


        var _this = this;

        _this.current_timeout_time = _this.$refs.currentSlide.data('slidizle-timeout') || _this.settings.timeout;
        _this.total_timeout_time = _this.$refs.currentSlide.data('slidizle-timeout') || _this.settings.timeout;

    };


    Slidizle.prototype._startTimer = function() {


        var _this = this,
            $this = _this.$this;


        clearInterval(_this._internalTimer);
        _this._internalTimer = setInterval(function() {


            _this.current_timeout_time -= 10;


            if (_this.current_timeout_time <= 0) {

                _this.next();
            }

        },10);

    };


    Slidizle.prototype._changeMedias = function()
    {

        var _this = this,
            $this = _this.$this,
            disabledClass = _this.settings.classes.disabled;


        _this._updateSlidesRefs();


        if (_this.settings.beforeChange) _this.settings.beforeChange(_this);
        $this.trigger('slidizle.beforeChange', [_this]);


        _this._stopTimer();


        if (_this.$refs.next)
        {
            if (_this.isLast() && ! _this.isLoop())
            {
                _this.$refs.next.addClass(disabledClass);
            } else {
                if (_this.$refs.next.hasClass(disabledClass)) _this.$refs.next.removeClass(disabledClass);
            }
        }
        if (_this.$refs.previous)
        {
            if (_this.$refs.previous && _this.isFirst() && ! _this.isLoop())
            {
                _this.$refs.previous.addClass(disabledClass);
            } else {
                if (_this.$refs.previous.hasClass(disabledClass)) _this.$refs.previous.removeClass(disabledClass);
            }
        }


        var current_slide_id = _this.$refs.currentSlide.attr('zui-data-carousel-slide-id');
        _this.$refs.navigation.each(function() {
            var $nav = $(this),
                current_navigation_by_slide_id = $(this).children('[zui-data-carousel-slide-id="'+current_slide_id+'"]');

            if (current_slide_id && current_navigation_by_slide_id)
            {
                $nav.children().removeClass(_this.settings.classes.active);
                current_navigation_by_slide_id.addClass(_this.settings.classes.active);
            } else {
                $nav.children().removeClass(_this.settings.classes.active);
                $nav.children(':eq('+_this.current_index+')').addClass(_this.settings.classes.active);
            }

        });


        _this.$refs.slider.addClass(_this.settings.classes.loading);


        _this.$refs.currentSlide.addClass(_this.settings.classes.loading);


        if ( ! _this.settings.loadBeforeTransition || _this.settings.loadBeforeTransition == 'false')
        {

            launchTransition();
        } else {

            if (_this.settings.beforeLoading) _this.settings.beforeLoading(_this);
            $this.trigger('slidizle.beforeLoading', [_this]);


            _this._loadSlide(_this.$refs.currentSlide, function($slide) {


                $slide.removeClass(_this.settings.classes.loading);


                _this.$refs.slider.removeClass(_this.settings.classes.loading);


                if (_this.settings.afterLoading) _this.settings.afterLoading(_this);
                $this.trigger('slidizle.afterLoading', [_this]);

                launchTransition();
            });
        }


        function launchTransition()
        {

            if (_this.$refs.previousActiveSlide) _this.$this.removeClass('slide-'+_this.$refs.previousActiveSlide.index());


            _this.$this.addClass('slide-'+_this.$refs.currentSlide.index());


            if (_this.isLast()) _this.$this.addClass(_this.settings.classes.last);
            else _this.$this.removeClass(_this.settings.classes.last);
            if (_this.isFirst()) _this.$this.addClass(_this.settings.classes.first);
            else _this.$this.removeClass(_this.settings.classes.first);


            if (_this.$refs.previousActiveSlide) _this.$this.removeClass('loaded-slide-'+_this.$refs.previousActiveSlide.index());


            _this.$this.addClass('loaded-slide-'+_this.$refs.currentSlide.index());


            _this.$refs.medias.removeClass(_this.settings.classes.active);


            _this.$refs.currentSlide.addClass(_this.settings.classes.active);


            _this.$refs.medias
            .removeClass(_this.settings.classes.beforeActive)
            .removeClass(_this.settings.classes.afterActive);


            _this.getBeforeActiveSlides().addClass(_this.settings.classes.beforeActive);
            _this.getAfterActiveSlides().addClass(_this.settings.classes.afterActive);


            _this.$refs.medias
            .removeClass(_this.settings.classes.previousActive)
            .removeClass(_this.settings.classes.nextActive);


            _this.getPreviousSlide().addClass(_this.settings.classes.previousActive);
            _this.getNextSlide().addClass(_this.settings.classes.nextActive);


            if (_this.settings.onChange) _this.settings.onChange(_this);
            $this.trigger('zui-carousel.change', [_this]);


            if (_this.$refs.currentSlide.index() == 0 && _this.$refs.previousSlide)
            {
                if (_this.$refs.previousSlide.index() == _this.$refs.medias.length-1) {
                    if (_this.settings.onNext) _this.settings.onNext(_this);
                    $this.trigger('slidizle.next', [_this]);
                } else {
                    if (_this.settings.onPrevious) _this.settings.onPrevious(_this);
                    $this.trigger('slidizle.previous', [_this]);
                }
            } else if (_this.$refs.currentSlide.index() == _this.$refs.medias.length-1 && _this.$refs.previousSlide)
            {
                if (_this.$refs.previousSlide.index() == 0) {
                    if (_this.settings.onPrevious) _this.settings.onPrevious(_this);
                    $this.trigger('slidizle.previous', [_this]);
                } else {
                    if (_this.settings.onNext) _this.settings.onNext(_this);
                    $this.trigger('slidizle.next', [_this]);
                }
            } else if (_this.$refs.previousSlide) {
                if (_this.$refs.currentSlide.index() > _this.$refs.previousSlide.index()) {
                    if (_this.settings.onNext) _this.settings.onNext(_this);
                    $this.trigger('slidizle.next', [_this]);
                } else {
                    if (_this.settings.onPrevious) _this.settings.onPrevious(_this);
                    $this.trigger('slidizle.previous', [_this]);
                }
            } else {
                if (_this.settings.onNext) _this.settings.onNext(_this);
                $this.trigger('slidizle.next', [_this]);
            }


            if (_this.getTotalTimeout()
                && ! _this._isOver
                && _this.isPlay()
            ) _this._startTimer();


            if (_this.settings.afterChange) _this.settings.afterChange(_this);
            $this.trigger('slidizle.afterChange', [_this]);
        }
    }


    Slidizle.prototype._updateSlidesRefs = function() {


        var _this = this,
            $this = _this.$this;


        var cI = _this.current_index || 0,
            nI = _this.next_index || (_this.current_index+1 < _this.total) ? _this.current_index+1 : 0,
            pI = _this.previous_index || (_this.current_index-1 >= 0) ? _this.current_index-1 : _this.total-1;


        if ( _this.$refs.currentSlide) _this.$refs.previousActiveSlide = _this.$refs.currentSlide;


        _this.$refs.previousSlide = _this.$refs.content.children(':eq('+pI+')');;


        _this.$refs.currentSlide = _this.$refs.content.children(':eq('+cI+')');


        _this.$refs.nextSlide = _this.$refs.content.children(':eq('+nI+')');


        _this.$refs.beforeActiveSlides = _this.$refs.medias.filter(':lt('+cI+')');


        _this.$refs.afterActiveSlides = _this.$refs.medias.filter(':gt('+cI+')');

    }


    Slidizle.prototype._loadSlide = function(content, callback) {

        // vars :
        var _this = this,
            $this = _this.$this,
            $content = $(content),
            toLoad = [], loaded = 0;


        var $items = $content.find('*:not(script)').filter(function() {
            return $(this).closest('[zui-data-carousel]').get(0) == _this.$this.get(0);
        });


        $items = $items.add($content);


        $items.each(function() {


            var $item = $(this),
                imgUrl;


            if (typeof $item.attr('zui-data-carousel-preload-custom') != 'undefined' && $item.attr('zui-data-carousel-preload-custom') !== false)
            {

                toLoad.push({
                    type : 'custom',
                    $elm : $item
                });
                return;
            }


            if ($item.css('background-image').indexOf('none') == -1) {
                var bkg = $item.css('background-image');
                if (bkg.indexOf('url') != -1) {
                    var temp = bkg.match(/url\((.*?)\)/);
                    imgUrl = temp[1].replace(/\"/g, '');
                }
            } else if ($item.get(0).nodeName.toLowerCase() == 'img' && typeof($item.attr('src')) != 'undefined') {
                imgUrl = $item.attr('src');
            }

            if ( ! imgUrl) return;


            toLoad.push({
                type : 'image',
                url : imgUrl
            });

        });


        if ( ! toLoad.length)
        {
            callback($content);
            return;
        }


        $(toLoad).each(function(index, item) {


            switch (item.type) {
                case 'image':

                    var imgLoad = new Image();
                    $(imgLoad).load(function() {

                        loadedCallback();
                    }).error(function() {

                        loadedCallback();
                    }).attr('src', item.url);
                break;
                case 'custom':

                    item.$elm.bind('slidizle.loaded', function(e) {

                        loadedCallback();
                    });
                break;
            }
        });


        _this.loadingProgress = 0;


        function loadedCallback() {

            loaded++;


            _this.loadingProgress = 100 / toLoad.length * loaded;


            if (_this.settings.onLoading) _this.settings.onLoading(_this);
            $this.trigger('slidizle.onLoading', [_this]);


            if (loaded >= toLoad.length) callback($content);
        }

    }


    Slidizle.prototype.play = function()
    {

        var _this = this,
            $this = _this.$this;


        if (_this.isDisabled()) return;


        if (_this._isPlaying || ! _this.getTotalTimeout() || ! _this.$refs.medias.length) return;


        _this.$this.removeClass(_this.settings.classes.pause);
        _this.$this.removeClass(_this.settings.classes.stop);


        _this.$this.addClass(_this.settings.classes.play);


        _this._isPause = false;

        _this._isPlaying = true;


        _this._resetTimer();


        _this._startTimer();


        if (_this.settings.onPlay) _this.settings.onPlay(_this);
        $this.trigger('zui-carousel.play', [_this]);
    }


    Slidizle.prototype.resume = function() {


        var _this = this,
            $this = _this.$this;


        if (_this.isDisabled()) return;


        if ( ! _this.isPause()) return;


        _this.$this.removeClass(_this.settings.classes.pause);
        _this.$this.removeClass(_this.settings.classes.stop);


        _this.$this.addClass(_this.settings.classes.play);


        _this._startTimer();


        _this._isPause = false;
        _this._isPlaying = true;


        if (_this.settings.onResume) _this.settings.onResume(_this);
        $this.trigger('zui-carousel.resume', [_this]);

    };


    Slidizle.prototype.pause = function()
    {

        var _this = this,
            $this = _this.$this;


        if (_this.isDisabled()) return;


        if ( ! _this.isPlay()) return;


        _this.$this.removeClass(_this.settings.classes.play);
        _this.$this.removeClass(_this.settings.classes.stop);


        _this._isPause = true;

        _this._isPlaying = false;


        _this._pauseTimer();


        _this.$this.addClass(_this.settings.classes.pause);


        if (_this.settings.onPause) _this.settings.onPause(_this);
        $this.trigger('zui-carousel.pause', [_this]);
    }


    Slidizle.prototype.stop = function()
    {

        var _this = this,
            $this = _this.$this;


        if (_this.isDisabled()) return;


        if ( ! _this.isPlay()) return;


        _this.$this.removeClass(_this.settings.classes.play);
        _this.$this.removeClass(_this.settings.classes.pause);


        _this._isPause = false;

        _this._isPlaying = false;

        _this._stopTimer();

        _this.$this.addClass(_this.settings.classes.stop);

        if (_this.settings.onStop) _this.settings.onStop(_this);
        $this.trigger('slidizle.stop', [_this]);
    }


    Slidizle.prototype.togglePlayPause = function()
    {

        var _this = this,
            $this = _this.$this;


        if (_this.isDisabled()) return;


        if (_this._isPlaying) _this.pause();
        else _this.play();
    }


    Slidizle.prototype.next = function()
    {

        var _this = this,
            $this = _this.$this,
            disabledClass = _this.settings.classes.disabled;


        if (_this.isDisabled()) return;


        if ( ! _this.isLoop() && _this.isLast()) return;


        _this.$this.removeClass(_this.settings.classes.backward);
        _this.$this.addClass(_this.settings.classes.forward);

        _this._previous_active_index = _this.current_index;


        _this.current_index = (_this.current_index+1 < _this.total) ? _this.current_index+1 : 0;


        _this.previous_index = (_this.current_index-1 >= 0) ? _this.current_index-1 : _this.total-1;


        _this.next_index = (_this.current_index+1 < _this.total) ? _this.current_index+1 : 0;


        _this._changeMedias();
    }


    Slidizle.prototype.previous = function()
    {

        var _this = this,
            $this = _this.$this;


        if (_this.isDisabled()) return;


        if ( ! _this.isLoop() && _this.isFirst()) return;


        _this.$this.removeClass(_this.settings.classes.forward);
        _this.$this.addClass(_this.settings.classes.backward);


        _this._previous_active_index = _this.current_index;


        _this.current_index = (_this.current_index-1 < 0) ? _this.total-1 : _this.current_index-1;


        _this.previous_index = (_this.current_index-1 >= 0) ? _this.current_index-1 : _this.total-1;


        _this.next_index = (_this.current_index+1 < _this.total) ? _this.current_index+1 : 0;


        _this._changeMedias();
    }


    Slidizle.prototype.goto = function(ref)
    {

        var _this = this,
            $this = _this.$this,
            $slide = null;


        if (_this.isDisabled()) return;


        if (typeof ref == 'string') {

            if (ref.substr(0,1) == '.' || ref.substr(0,1) == '#') {

                $slide = _this.$refs.content.children(ref);
            } else {

                var slideById = _this.$refs.medias.filter('[zui-data-carousel-slide-id="'+ref+'"]');
                if (slideById.length == 1) {
                    $slide = slideById;
                } else if (_this.$refs.medias.filter('#'+ref).length == 1) {
                    $slide = _this.$refs.medias.filter('#'+ref);
                }
            }
        } else if (typeof ref == 'number') {

            $slide = _this.$refs.medias.filter(':eq('+ref+')');
        }


        if ($slide && $slide.index() != null) {

            _this.current_index = $slide.index();

            _this._changeMedias();
        }
    }


    Slidizle.prototype.gotoAndPlay = function(ref)
    {

        if (this.isDisabled()) return;


        this.gotoSlide(ref);


        this.play();
    }


    Slidizle.prototype.gotoAndStop = function(ref)
    {

        if (this.isDisabled()) return;


        this.gotoSlide(ref);


        this.stop();
    }


    Slidizle.prototype.getCurrentSlide = function() {
        return this.$refs.currentSlide;
    }


    Slidizle.prototype.getActiveSlide = Slidizle.prototype.getCurrentSlide;


    Slidizle.prototype.getPreviousSlide = function() {
        return this.$refs.previousSlide;
    }


    Slidizle.prototype.getNextSlide = function() {
        return this.$refs.nextSlide;
    }


    Slidizle.prototype.getBeforeActiveSlides = function() {
        return this.$refs.beforeActiveSlides;
    }


    Slidizle.prototype.getAfterActiveSlides = function() {
        return this.$refs.afterActiveSlides;
    }


    Slidizle.prototype.getPreviousActiveSlide = function() {
        return this.$refs.previousActiveSlide;
    }


    Slidizle.prototype.getAllSlides = function() {
        return this.$refs.medias;
    }


    Slidizle.prototype.getSettings = function() {
        return this.settings;
    }


    Slidizle.prototype.getLoadingProgress = function() {
        return this.loadingProgress;
    }


     Slidizle.prototype.getRemainingTimeout = function() {
        return this.current_timeout_time;
     };


    Slidizle.prototype.getCurrentTimeout = function() {
        var t = this.$refs.currentSlide.data('slidizle-timeout') || this.settings.timeout;
        if ( ! t) return null;
        return t - this.current_timeout_time;
    };


    Slidizle.prototype.getTotalTimeout = function() {
        return this.total_timeout_time || this.settings.timeout || false;
    };


    Slidizle.prototype.isLast = function() {
        return (this.getCurrentSlide().index() >= this.getAllSlides().length-1);
    }


    Slidizle.prototype.isFirst = function() {
        return (this.getCurrentSlide().index() <= 0);
    }


    Slidizle.prototype.isHover = function() {
        return this._isOver;
    }


    Slidizle.prototype.isDisabled = function() {

        var disabled = false;
        if (typeof this.settings.disabled == 'function') disabled = this.settings.disabled();
        else disabled = this.settings.disabled;


        if (disabled) this.$this.addClass(this.settings.classes.disabled);
        else this.$this.removeClass(this.settings.classes.disabled);


        return disabled;
    }


    Slidizle.prototype.isLoop = function() {
        var loop = this.settings.loop;
        return (loop && loop != 'false');
    };


    Slidizle.prototype.isPlay = function() {
        return this._isPlaying;
    };


    Slidizle.prototype.isPause = function() {
        return this._isPause;
    };


    Slidizle.prototype.isStop = function() {
        return ( ! this._isPlaying && ! this._isPause);
    };


    Slidizle.prototype._extendSettings = function(options) {


        var _this = this,
            $this = _this.$this;


        _this.settings = $.extend(_this.settings, options, true);


        var flattenObject = function(ob) {
            var toReturn = {};
            for (var i in ob) {

                if (!ob.hasOwnProperty(i)) continue;
                if ((typeof ob[i]) == 'object' && ob[i] != null) {
                    var flatObject = flattenObject(ob[i]);
                    for (var x in flatObject) {
                        if (!flatObject.hasOwnProperty(x)) continue;
                        toReturn[i + '.' + x] = flatObject[x];
                    }
                } else {
                    toReturn[i] = ob[i];
                }
            }
            return toReturn;
        };


        var flatSettings = flattenObject(_this.settings);


        for (var name in flatSettings)
        {

            var inline_setting = 'slidizle-' + name.replace('.','-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
                inline_attr = $this.data(inline_setting);


            if (typeof inline_attr !== 'undefined') {

                if (typeof inline_attr == 'number' || typeof inline_attr == 'boolean')
                    eval('_this.settings.'+name+' = '+inline_attr);
                else
                    eval('_this.settings.'+name+' = "'+inline_attr+'"');
            }
        }

    };


    $.fn.slidizle = function(method) {


        if (Slidizle.prototype[method]) {


            var args = Array.prototype.slice.call(arguments, 1);


            this.each(function() {

                var plugin = $(this).data('zui-carousel-api');

                plugin[method].apply(plugin, args);
            });
        } else if (typeof method == 'object' || ! method) {


            var args = Array.prototype.slice.call(arguments);


            this.each(function() {
                $this = $(this);


                if ($this.data('zui-carousel-api') != null && $this.data('zui-carousel-api') != '') return;


                var api = new Slidizle($this, args[0]);


                $this.data('zui-carousel-api', api);
            });
        } else {

            $.error( 'Method ' +  method + ' does not exist on jQuery.slidizle' );
        }


        return this;
    }

    return Slidizle;

}));


