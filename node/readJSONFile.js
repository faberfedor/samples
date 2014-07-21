/*
 *
 * My first attempt to use node.js to read in a HAR file and put it into the database
 *
 */

var fs = require("fs"),
    sys = require('sys');

var log4js = require('log4js')(); //note the need to call the function
    log4js.addAppender(log4js.consoleAppender());
    log4js.addAppender(log4js.fileAppender('logs/readCookieJar.js.log'), 'rcj');

var log = log4js.getLogger('rcj');
    log.setLevel('FATAL');


var Client = require('mysql').Client,
    client = new Client();

    client.database = 'sentry';
    client.user = 'root';
    client.password = '';

    client.connect();

var path = './aCookieJar/www.cbsnews.com+2011-03-09+19-03-36.har';
//var path = './aCookieJar/baby.har';
var schema = '';
var domainCache = new Array()
domainCache['domain'] = 'id';

    fs.readFile(path, function(err, data) { 
        var schema = JSON.parse(data);

        // package the HAR into an object for easy passing
        var har = {};
            har.uuid = 'uuid';
            har.loadUUID = 'loadUUID';
            har.url='url';
            har.ldId = 'ld.ldId';
            har.filename = 'filename';
        // does loadUUID and url already exist in the DB?
        client.query('select * from HARs where loadUUID = ? and url = ?',
                     [har.loadUUID, har.url],
                     function(err, info) {
                        if ( err ) {
                            throw err;
                        }
                        if (info.length == 0) {
                        
                            postHarData(har, schema.log.entries);
 
                        }
                     }
        ); 
});

//process.exit();

var postHarData = function(h, entries ){

    log.trace("Inside postHarData");
    client.query('insert into HARs (ldId, filename, UUID, loadUUID, url, ts) ' 
                + 'values(?, ?, ?, ? ,?, NOW())',
                [h.ldId, h.filename, h.uuid, h.loadUUID, h.url],
                function(err, info) {
                    if(err) {
                        throw err;
                    }
                    log.debug("Successfully posted harId " + info.insertId);
                    postEntriesData(info.insertId, entries);
                });
}

var postEntriesData = function(harId, entries) {

    for (var e in entries) {
        (function(ent) {
            client.query('insert into entries (harId, startedDateTime, time) ' +
                         ' values(?, ?, ?)',
                    [harId, entries[e].startedDateTime, entries[e].time],
                    function(err, info) {
                        if(err) {
                            throw err;
                        }
                        log.debug("Successfully posted entId " + info.insertId);
                        log.debug("request.url is " + ent.request.url);
                        postResponseData(info.insertId, ent.response);
                        postRequestData( info.insertId, ent.request);
                });
        })(entries[e]);
    }
}

 
var postResponseData = function(entId, response) {
    client.query('insert into responses (entId, redirectURL, status) ' +
                 ' values(?, ?, ?)',
                [entId, response.redirectURL, response.status],
                function(err, info) {
                    if(err) {
                        throw err;
                    }
                    log.debug("Successfully posted resId " + info.insertId);
                    if(response.cookies.length > 0) {
                        postResponseCookies( info.insertId, response.cookies);
                    }
                });
}

var postResponseCookies = function(resId, cookies) {

    for ( co in cookies) {
        (function(c) {
            client.query('insert into responseCookies ' + 
                     '(domain, name, value, path, expires, resId, doId) ' +
                     'values(?, ?, ?, ?, ?, ?, ?)',
                    [c.domain, c.name, c.value, c.path, c.expires, resId, c.doId],
                    function( err, info ) {
                        if(err) {
                            throw err;
                        }

                        log.debug("Successfully posted response coId " + info.insertId);
                    });
        })(cookies[co]);
    }
}

var postRequestData = function(entId, request) {
    domain = 'foo';
    client.query('insert into requests ( entId, url, method, domain) ' +
                 ' values(?, ?, ?, ?) ',
                [entId, request.url, request.method, domain],
                function(err, info) {
                    if(err) {
                        throw err;
                    }
                    log.debug("Successfully posted reqId " + info.insertId);
                    if (request.cookies.length > 0) {
                        postRequestCookies( info.insertId, request.cookies);
                    }
                });
}

var postRequestCookies = function(reqId, cookies) {
    
    for ( co in cookies ) {
        (function(c) {
		    client.query('insert into requestCookies ' + 
		                 '(domain, name, value, path, expires, reqId, doId) ' +
		                 'values(?, ?, ?, ?, ?, ?, ?)',
		                 [c.domain, c.name, c.value, c.path, c.expires, reqId, c.doId],
		                 function( err, info ) {
		                    if(err) {
		                        throw err;
		                    }
		                    log.debug("Successfully posted request coId " + info.insertId);
		
		                });
        })(cookies[co]);
    }
}

var getDomainId = function(domain) {

    d = (domain === '') ? 'emptydomain' : domain;
 
    // check the cache for the domain name/id
    if ( domainCache[d] !== undefined) {
        // cache hit
        return domainCache[d]
    }
    // if not in cache, check if in DB
    client.query('select doId from domains where domain = %s',
                 [d],
                 function(err, info) {
                    if(err) {
                        throw err;
                    }
                    if (info.insertId) {
                        return info.insertId;
                    } else {
                        client.query('insert into domains (domain) values (%s)',
                                     [d],
                                     function( err, info ) {

                                        if(err) {
                                            throw err;
                                        }
                                        if(info.insertId) {
                                          return info.insertId;
                                        }
                                     });
                        }
                    });
                    
}
