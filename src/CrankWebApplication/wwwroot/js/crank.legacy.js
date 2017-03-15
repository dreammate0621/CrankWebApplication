/**
 * This code should be moved to Angular directives
 * as it deals mainly with DOM manipulation an jQuery plugins
 * */

window.crank = {};

crank.ui = { 
    initStationsCarousel: function() {
        // TODO refactor into directives
        var visible_items = 4;
        var _onBefore = function() {
            $(this).find('img').stop().fadeTo( 300, 1 );
            //$pagers.removeClass( 'selected' );
        };

        setTimeout(function(){
        $('#stations-carousel').carouFredSel({
            items: visible_items,
            width: '100%',
            auto: false,
            scroll: {
                duration: 750
            },
            prev: {
                button: '#stations-carousel-prev',
                items: 1,
                onBefore: _onBefore
            },
            next: {
                button: '#stations-carousel-next',
                items: 1,
                onBefore: _onBefore
            },
        });
        },500);

    },
    /*
    initTilesCarousel: function() {
        var visible_items = 3;
        var $pagers = $('#pager a');
        var _onBefore = function() {
            $(this).find('img').stop().fadeTo( 300, 1 );
            $pagers.removeClass( 'selected' );
        };

        setTimeout(function(){
        $('#tiles-carousel').carouFredSel({
            //circular: false,
            infinite: true,
            items: visible_items,
            width: '100%',
            auto: false,
            scroll: {
                duration: 750
            },
            prev: {
                button: '#tiles-carousel-prev',
                items: 1,
                onBefore: _onBefore
            },
            next: {
                button: '#tiles-carousel-next',
                items: 1,
                onBefore: _onBefore
            },
        });
        },25);

        $pagers.click(function( e ) {
            e.preventDefault();

            var group = $(this).attr( 'href' ).slice( 1 );
            var slides = $('#carousel div.' + group);
            var deviation = Math.floor( ( _visible - slides.length ) / 2 );
            if ( deviation < 0 ) {
                deviation = 0;
            }

            $('#carousel').trigger( 'slideTo', [ $('#' + group), -deviation ] );
            $('#carousel div img').stop().fadeTo( 600, 0.3 );
            slides.find('img').stop().fadeTo( 600, 1 );

            $(this).addClass( 'selected' );
        });
    }
    */


};

