/*
 * Jukebox Programming challenge:
 *
 * Imagine we are launching a music streaming service for cafes and restaurants.
 * For all visitors who come in and join the WiFi/Bluetooth network, music
 * preferences are loaded and taken into account when streaming music at the
 * venue. In other words, playlists are dynamically generated based on who is
 * inside at the moment.
 *
 * TypeScript implementation by Rik de Boer 1 Aug 2022
 *
 * TypeScript cannot be run in a browser verbatim. However I've transpiled this
 * file to JavaScript so it can be run in the browser simply by double-clicking
 * the .html file that accompanies this file.
 * Enjoy the demo!
 *
 * Further design and implementation comments inserted below.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Artist sample data. mp3s are available for all of the titles below.
var artists = [
    { name: "ABBA", songTitles: ["Money, Money, Money", "Take A Chance On Me"] },
    { name: "Beatles", songTitles: ["She Loves You", "A Hard Day's Night"] },
    { name: "Elvis Presley", songTitles: ["Jailhouse Rock", "Hound Dog"] },
    { name: "INXS", songTitles: ["Need You Tonight"] },
    { name: "Paul Kelly", songTitles: ["From St Kilda To Kings Cross", "Dumb Things"] },
    { name: "Rick Astley", songTitles: ["Never Gonna Give You Up"] },
    { name: "Rolling Stones", songTitles: ["Brown Sugar", "Gimme Shelter", "Satisfaction"] },
];
// This array serves to mimic a stream of vistors arriving at the venue,
// each holding some kind of app that communicates (via WiFi/Bluetooth?) the
// owner's nickname and favorite music artists to the Jukebox software running
// at the venue. During initialisation the array is shuffled to create
// different variantions when re-run.
var visitorSample = [
    { nickname: "Dan", likes: ["INXS", "Beatles"] },
    { nickname: "Alex", likes: ["Elvis Presley", "ABBA"] },
    { nickname: "Scott", likes: ["Rick Astley"] },
    { nickname: "Rik", likes: ["Rick Astley", "Rolling Stones", "Beatles"] },
];
//-- class VisitorManager -----------------------------------------------------
/**
 * Class responsible for reporting on arriving visitors and passing their
 * favourite artists on to the jukebox
 * A venue may have a VisitorManager at each entrance, with each of these
 * VisitorManagers connecting to the same or different Jukeboxes.
 * Note that there is no neeed for the VisitorManager to keep track of
 * all visitors that have entered the venue.
 */
var VisitorManager = /** @class */ (function () {
    /**
     * Upon construction the VisitorManager is injected with the Jukebox it
     * passes visitors' favorite Artists to plus an HTML element to report
     * through.
     * @param jukebox
     * @param visitorsElementId, id of HTML element on the dashboard page
     */
    function VisitorManager(jukebox, visitorsElementId) {
        this.jukebox = jukebox;
        this.visitorsElement = document.getElementById(visitorsElementId);
    }
    /**
     * It is imagined that this function is called in response to the system
     * receiving, perhaps via Bluetooth, a new visitor's nickname and names
     * of favorite artists.
     *
     * @param visitor, holds nickname and favorite artists
     * @param callback, a way for the caller to find out whether the visitor
     *   and their favorite artists were correctly received.
     */
    VisitorManager.prototype.admitVisitor = function (visitor, callback) {
        // Report new arrival on the dashboard page.
        this.visitorsElement.innerHTML += "".concat(visitor.nickname, " just entered; loves ").concat(visitor.likes.join(' and '), "<br/>");
        // Then pass this visitor's details (nickname, fav. artists) to the jukebox.
        // The jukebox will respond by calling the callback with a status code
        // and explanatory message.
        this.jukebox.newVisitor(visitor, function (success, message) {
            callback(success, message);
        });
    };
    return VisitorManager;
}());
//--- class Jukebox -----------------------------------------------------------
/**
 * Class responsible for incorporating arriving visitors' favourite artists
 * into the playlist on a first-come, first-served basis.
 * Makes sure not to play the same song twice when an artist is among multiple
 * visitor's favourites.
 */
var Jukebox = /** @class */ (function () {
    function Jukebox(artists, initialPlaylist, playlistElementId, songElementId) {
        this.artists = artists;
        this.playlist = initialPlaylist;
        this.playlistElement = document.getElementById(playlistElementId);
        this.currentSongElement = document.getElementById(songElementId);
    }
    /**
     * Jukebox new visitor handler.
     * The function picks an artist from the supplied visitor's favorites and
     * scans the jukebox's archive for a song by that artist that hasn't been
     * played yet.
     *
     * @param visitor, a new visitor just arriving at the venue
     * @param callback, when done, notifies interested party with fail/success flag and msg
     */
    Jukebox.prototype.newVisitor = function (visitor, callback) {
        var _loop_1 = function (trial) {
            var favArtistName = Jukebox.randomPick(visitor.likes);
            var favArtist = this_1.artists.find(function (artist) { return artist.name === favArtistName; });
            if (!favArtist) {
                callback(false, "Artist not found: ".concat(favArtistName));
            }
            var randomSongTitle = Jukebox.randomPick(favArtist.songTitles);
            var alreadyPlayed = this_1.playlist.find(function (song) { return song.artist === favArtistName && song.title === randomSongTitle; });
            if (!alreadyPlayed) {
                this_1.playlist.push({ title: randomSongTitle, artist: favArtistName });
                var msg = "Added for ".concat(visitor.nickname, ": \"").concat(randomSongTitle, "\" by ").concat(favArtistName);
                this_1.playlistElement.innerHTML += msg + "<br/>";
                // Courtesy: notify the caller that it's done and was a success.
                callback(true, msg);
                return { value: void 0 };
            }
        };
        var this_1 = this;
        // Try up to 10 times to find a random song not already on the playlist.
        for (var trial = 1; trial <= 10; trial++) {
            var state_1 = _loop_1(trial);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        callback(false, "Could not find a song for ".concat(visitor.nickname, " that isn't on the playlist already."));
    };
    /**
     * This functions starts a continous loop of playing the next song on
     * this.playlist, if there is one. Played songs are remembered to avoid
     * repitition.
     */
    Jukebox.prototype.play = function () {
        return __awaiter(this, void 0, void 0, function () {
            var p, song;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = 0;
                        _b.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 6];
                        if (!(p < this.playlist.length)) return [3 /*break*/, 3];
                        song = this.playlist[p];
                        return [4 /*yield*/, this.playOneSong(song.artist, song.title)];
                    case 2:
                        _b.sent();
                        p++;
                        return [3 /*break*/, 5];
                    case 3: 
                    // No (new) songs. Keep waiting for new ones to come in.
                    return [4 /*yield*/, Jukebox.timeGoesBy(0.5)];
                    case 4:
                        // No (new) songs. Keep waiting for new ones to come in.
                        _b.sent();
                        _b.label = 5;
                    case 5: return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Plays the supplied song as an mp3 from the audio-tracks/ARTIST folder,
     * on a third-party music "library".
     * @param artist
     * @param song
     */
    Jukebox.prototype.playOneSong = function (artist, song) {
        return __awaiter(this, void 0, void 0, function () {
            var file, audio;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        file = "https://mondrify.com/audio-tracks/".concat(artist, "/").concat(artist, " - ").concat(song, ".mp3");
                        audio = new Audio(file);
                        this.currentSongElement.innerHTML = "\"".concat(song, "\" by ").concat(artist);
                        // Play song -- duration set to fixed number of seconds.
                        audio.play();
                        return [4 /*yield*/, Jukebox.timeGoesBy(Jukebox.PLAYTIME_IN_SECS)];
                    case 1:
                        _b.sent();
                        audio.pause();
                        this.currentSongElement.innerHTML = "<em>Nothing -- silence.</em>";
                        return [2 /*return*/];
                }
            });
        });
    };
    var _a;
    _a = Jukebox;
    Jukebox.PLAYTIME_IN_SECS = 9;
    // Jukebox helper functions
    Jukebox.timeGoesBy = function (secs) { return __awaiter(_a, void 0, void 0, function () { return __generator(_a, function (_b) {
        return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, secs * 1000); })];
    }); }); };
    Jukebox.randomPick = function (array) { return array[Math.floor(Math.random() * array.length)]; };
    return Jukebox;
}());
//-- Helper functions ------------------------------------------------------------
// Shuffle Visitor data to make visitors arrive in random order, so the page
// presents slightly different every time it is run.
var shuffle = function (array) {
    var _b;
    for (var i = array.length - 1; i > 0; i--) {
        // Pick a random index between 0 and i
        var j = Math.floor(Math.random() * (i + 1));
        // Swap the elemens at indices i and j
        _b = [array[j], array[i]], array[i] = _b[0], array[j] = _b[1];
    }
};
/**
 * Helper function to liston to a button that simulates the arrival of the next
 * visitor to the venue. Notifies the VisitorManager accordingly by calling
 * admitVisitor() on it.
 *
 * @param visitorSample, a sample of test visitors (names and favorite artists)
 * @param addVisitorButtonId, id of button that simulates arrival of visitor
 * @param visitorManager, the object to notify when a new visitor enters
 */
var receiveVisitors = function (visitorSample, addVisitorButtonId, visitorManager) {
    var visitorCount = 0;
    var addButton = document.getElementById("admit-visitor");
    if (!addButton) {
        console.error("Button to admit visitors is missing:", addVisitorButtonId);
        return;
    }
    addButton.addEventListener("click", function () {
        if (visitorCount < visitorSample.length) {
            var nextVisitor = visitorSample[visitorCount];
            visitorManager.admitVisitor(nextVisitor, function (success, message) {
                success ? console.log(message) : console.error(message);
            });
            visitorCount++;
        }
        else {
            alert('No more visitors. Please refresh the page to run again.');
        }
    });
};
//-- Main ---------------------------------------------------------------------
// We start by pressing "Play" on the jukebox.
// We could pre-load the jukebox with songs prior to the visitors arriving.
// We haven't done that here, so the jukeBox is silently waiting for
// notifications of new visitor arrivals to collect their artist preferences.
var intialPlaylist = [];
// Last 2 args are the HTML element ids to report current playlist and song.
var jukeBox = new Jukebox(artists, intialPlaylist, "playlist", "current-song");
jukeBox.play()["catch"](function (err) { return console.error(err); });
// Next let's get ready to receive visitors.
// The visitorManager is passed a ref to the Jukebox so they can notify
// the Jukebox of new arrivals ()
var visitorManager = new VisitorManager(jukeBox, "visitors");
// Open the doors!
// A stream of test visitors is simulated by clicking the "Admit next visitor"
// button. The visitorManager listens to clicks on the "admit-visitor" element
// to present the next visitor from the sample to the visitorManager.
shuffle(visitorSample);
receiveVisitors(visitorSample, "admit-visitor", visitorManager);
// A second VisitorManager could be instated at a second venue entrance,
// like below. This VisitorManager would use a second button to admit 
// visitors at the second entrance and may use the same or a different Jukebox
// instance (e.g. 1 or 2 seperate soundsystems, eg upstairs and downstairs).
// const visitorManager2 = new VisitorManager(jukeBox, "visitors")
// receiveVisitors(visitorSample2, "admit-visitor2", visitorManager2)
//# sourceMappingURL=jukebox.js.map