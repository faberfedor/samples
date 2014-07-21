
(function($) {

    var data = { "CoventGarden" : ["charming", "gardenesque", "covent-y"],
                 "CannonStreet" : ["cannons", "boom boom", "cannonball"],
                 "MansionHouse" : ["large", "scary", "vampires"],
                 "Blackfriars"  : ["black", "friars", "scary"],
                 "OxfordCircus" : ["clowns", "oxen", "Big Top"],
                 "Temple"       : ["holy", "ugly", "blimey!"]
            }

    var createTimer = function(key, interval) { 
               return function() {
                     setInterval(function() {
                        var term = $('#' + key + ' > span.term' );
                        var oldhtml = term.html();
                        var idx = data[key].indexOf(oldhtml);
                        if (idx === -1 || idx === (data[key].length - 1)) {
                            idx = Math.floor(Math.random()*(data[key].length - 1));
                        } else {
                            idx++ ;
                        }

                        var newhtml = data[key][idx] ;
                        term.fadeOut('fast', function() {
                                $(this).html(newhtml).fadeIn('slow')
                        }); 
                    }, interval);
                }
    };


    // set a randomize timer for each element
    var min = 15000, max = 30000;
    var interval, timers=[];
    for (var key in data) {
        interval = Math.floor(Math.random() * (max - min + 1)) + min;
        timers[key] = createTimer(key, interval);
        timers[key]();
        

    }

})(jQuery)
