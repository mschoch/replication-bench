// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
// either express or implied.
//
// See the License for the specific language governing permissions
// and limitations under the License.

var coux = require("coux").coux
, e = require('errlog').e
;

var MIN_DELAY = 5000; //ms ... max delay is 2x min delay

var photo_size = 2 * 1024 * 1024,
    photo = [];
for (var j=0; j < photo_size; j++) {
    photo.push("p");
};
photo = photo.join('');


var thumbnail_size = 200 * 1024,
    thumb = [];
for (var i=0; i < thumbnail_size; i++) {
    thumb.push("t");
};
thumb = thumb.join('');

function makeDoc() {
    var doc;
    if (Math.random() > 0.5) {
        doc = {
            type : "photo",
            owner : "damien",
            tags : ["hiking","vacation"]
        }
    } else {
        doc = {
            type : "thumbnail",
            owner : "yas",
            tags : ["concert"]
        }
    }
    return doc;
}

exports.start = function(notify, dbs) {
    function saveLoop(db) {
        var delay = MIN_DELAY + (Math.random() * MIN_DELAY);
        setTimeout(function() {
            saveDocAndPhoto(db);
            saveLoop(db);
        }, delay);
    }

    function saveDocAndPhoto(db) {
        var doc = makeDoc();
        if (doc.type == "photo") {
            savePhoto(db, doc);
        } else {
            saveThumbnail(db, doc);        
        }
    };

    function saveThumbnail(db, doc) {
        coux.post(db, doc, e(function(err, ok) {
            notify.start(db, ok.id);
            coux.put([db, ok.id, "thumb", {rev : ok.rev}], thumb, e(function(err, ok) {
                notify.saved(db, ok.id, ok.rev)
            }))
        }))
    }

    function savePhoto(db, doc) {
        coux.post(db, doc, e(function(err, ok) {
            notify.start(db, ok.id);
            coux.put([db, ok.id, "photo", {rev : ok.rev}], photo, e(function(err, ok) {
                notify.saved(db, ok.id, ok.rev)
            }))
        }))
    }

    dbs.forEach(saveLoop);
};







