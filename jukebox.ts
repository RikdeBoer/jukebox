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

type Song = {
  readonly artist: string;
  readonly title: string
}
type Artist = {
  readonly name: string // must be unique
  readonly songTitles: string[] // songTitles share same artist
}
type Visitor = {
  readonly nickname: string // does not have to be unique
  readonly likes: string[] // names of favorite Artists
}

// Artist sample data. mp3s are available for all of the titles below.
const artists: readonly Artist[] = [
  { name: "ABBA",          songTitles: ["Money, Money, Money", "Take A Chance On Me"]},
  { name: "Beatles",       songTitles: ["She Loves You", "A Hard Day's Night"]},
  { name: "Elvis Presley", songTitles: ["Jailhouse Rock", "Hound Dog"]},
  { name: "INXS",          songTitles: ["Need You Tonight"]},
  { name: "Paul Kelly",    songTitles: ["From St Kilda To Kings Cross", "Dumb Things"]},
  { name: "Rick Astley",   songTitles: ["Never Gonna Give You Up"]},
  { name: "Rolling Stones",songTitles: ["Brown Sugar", "Gimme Shelter", "Satisfaction"]},
]

// This array serves to mimic a stream of vistors arriving at the venue,
// each holding some kind of app that communicates (via WiFi/Bluetooth?) the
// owner's nickname and favorite music artists to the Jukebox software running
// at the venue. During initialisation the array is shuffled to create
// different variantions when re-run.
const visitorSample: Visitor[] = [
  { nickname: "Dan",   likes: ["INXS", "Beatles"]},
  { nickname: "Alex",  likes: ["Elvis Presley", "ABBA"]},
  { nickname: "Scott", likes: ["Rick Astley"]},
  { nickname: "Rik",   likes: ["Rick Astley", "Rolling Stones", "Beatles"]},
]

//-- class VisitorManager -----------------------------------------------------

/**
 * Class responsible for reporting on arriving visitors and passing their
 * favourite artists on to the jukebox
 * A venue may have a VisitorManager at each entrance, with each of these
 * VisitorManagers connecting to the same or different Jukeboxes.
 * Note that there is no neeed for the VisitorManager to keep track of
 * all visitors that have entered the venue. 
 */
class VisitorManager {

  // The VisitorManager is injected with a reference to its associated Jukebox.
  private readonly jukebox: Jukebox

  // The VisitorManager reports its visitors through an HTML element on the
  // dashboard page.
  private readonly visitorsElement: Element

  /**
   * Upon construction the VisitorManager is injected with the Jukebox it
   * passes visitors' favorite Artists to plus an HTML element to report 
   * through. 
   * @param jukebox 
   * @param visitorsElementId, id of HTML element on the dashboard page
   */
  constructor(jukebox: Jukebox, visitorsElementId: string) {
    this.jukebox = jukebox
    this.visitorsElement = document.getElementById(visitorsElementId)
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
  public admitVisitor(visitor: Visitor, callback: (succes: boolean, message: string) => void) {
    // Report new arrival on the dashboard page.
    this.visitorsElement.innerHTML += `${visitor.nickname} just entered; loves ${visitor.likes.join(' and ')}<br/>`
    // Then pass this visitor's details (nickname, fav. artists) to the jukebox.
    // The jukebox will respond by calling the callback with a status code
    // and explanatory message.
    this.jukebox.newVisitor(visitor, (success: boolean, message: string) => {
      callback(success, message)
    })
  }
}

//--- class Jukebox -----------------------------------------------------------

/**
 * Class responsible for incorporating arriving visitors' favourite artists
 * into the playlist on a first-come, first-served basis. 
 * Makes sure not to play the same song twice when an artist is among multiple
 * visitor's favourites.
 */
class Jukebox {
  private static PLAYTIME_IN_SECS: number = 9;

  // Available artists and their songs.
  private artists: readonly Artist[];

  // A list of Songs, both played and scheduled.
  // Typically the venue owner would clear this list every 24 hours or so.
  private playlist: Song[]

  // The Jukebox instance updates the page in 2 places, to update the upcoming
  // song titles and to update song currently playing song title.
  private readonly playlistElement: Element
  private readonly currentSongElement: Element

  constructor(artists: readonly Artist[], initialPlaylist: Song[], playlistElementId: string, songElementId: string) {
    this.artists = artists
    this.playlist = initialPlaylist
    this.playlistElement = document.getElementById(playlistElementId)
    this.currentSongElement = document.getElementById(songElementId)
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
  public newVisitor(visitor: Visitor, callback: (succes: boolean, message: string) => void) {
    // Try up to 10 times to find a random song not already on the playlist.
    for (let trial = 1; trial <= 10; trial++) {
      const favArtistName = Jukebox.randomPick(visitor.likes)
      const favArtist = this.artists.find(artist => artist.name === favArtistName);
      if (!favArtist) {
        callback(false, `Artist not found: ${favArtistName}`)
      }
      const randomSongTitle = Jukebox.randomPick(favArtist.songTitles)

      const alreadyPlayed = this.playlist.find(song => song.artist === favArtistName && song.title === randomSongTitle)
      if (!alreadyPlayed) {
        this.playlist.push({ title: randomSongTitle, artist: favArtistName })

        const msg = `Added for ${visitor.nickname}: "${randomSongTitle}" by ${favArtistName}`
        this.playlistElement.innerHTML += msg + `<br/>`

        // Courtesy: notify the caller that it's done and was a success.
        callback(true, msg)
        return
      }
    }
    callback(false, `Could not find a song for ${visitor.nickname} that isn't on the playlist already.`)
  }

  /**
   * This functions starts a continous loop of playing the next song on 
   * this.playlist, if there is one. Played songs are remembered to avoid
   * repitition. 
   */
  public async play() {
    let p = 0
    while (true) {
      if (p < this.playlist.length) {
        // We have songs left to play. Play current song till completion.
        const song = this.playlist[p]
        await this.playOneSong(song.artist, song.title)
        p++
      }
      else {
        // No (new) songs. Keep waiting for new ones to come in.
        await Jukebox.timeGoesBy(0.5)
      }
    }
  }

  /**
   * Plays the supplied song as an mp3 from the audio-tracks/ARTIST folder,
   * on a third-party music "library".
   * @param artist 
   * @param song 
   */
   protected async playOneSong(artist: string, song: string) {
    // Retrieve song from a pre-defined archive.
    const file = `https://mondrify.com/audio-tracks/${artist}/${artist} - ${song}.mp3`
    const audio = new Audio(file)
    
    this.currentSongElement.innerHTML = `"${song}" by ${artist}`

    // Play song -- duration set to fixed number of seconds.
    audio.play();
    await Jukebox.timeGoesBy(Jukebox.PLAYTIME_IN_SECS)
    audio.pause();

    this.currentSongElement.innerHTML = "<em>Nothing -- silence.</em>"
  }

  // Jukebox helper functions
  protected static timeGoesBy = async (secs: number) => 
     new Promise(resolve => setTimeout(resolve, secs * 1000))

  
  protected static randomPick = (array: string[]) => array[Math.floor(Math.random() * array.length)]
}

//-- Helper functions ------------------------------------------------------------

// Shuffle Visitor data to make visitors arrive in random order, so the page
// presents slightly different every time it is run.
const shuffle = (array: Visitor[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    // Pick a random index between 0 and i
    const j = Math.floor(Math.random() * (i + 1));
    // Swap the elemens at indices i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Helper function to liston to a button that simulates the arrival of the next
 * visitor to the venue. Notifies the VisitorManager accordingly by calling
 * admitVisitor() on it.
 *
 * @param visitorSample, a sample of test visitors (names and favorite artists)
 * @param addVisitorButtonId, id of button that simulates arrival of visitor
 * @param visitorManager, the object to notify when a new visitor enters
 */
 const receiveVisitors = (visitorSample: ReadonlyArray<Visitor>, addVisitorButtonId: string, visitorManager: VisitorManager) => {
  let visitorCount = 0
  const addButton: Element | null = document.getElementById("admit-visitor")
  if (!addButton) {
    console.error("Button to admit visitors is missing:", addVisitorButtonId)
    return
  }
  addButton.addEventListener("click", () => {
    if (visitorCount < visitorSample.length) {
      const nextVisitor = visitorSample[visitorCount]
      visitorManager.admitVisitor(nextVisitor, (success, message) => {
        success ? console.log(message) : console.error(message)
      })
      visitorCount++
    }
    else {
      alert('No more visitors. Please refresh the page to run again.')
    }
  })
}

//-- Main ---------------------------------------------------------------------

// We start by pressing "Play" on the jukebox.
// We could pre-load the jukebox with songs prior to the visitors arriving.
// We haven't done that here, so the jukeBox is silently waiting for
// notifications of new visitor arrivals to collect their artist preferences.
const intialPlaylist = []
// Last 2 args are the HTML element ids to report current playlist and song.
const jukeBox = new Jukebox(artists, intialPlaylist, "playlist", "current-song")
jukeBox.play()
    .catch(err => console.error(err));

// Next let's get ready to receive visitors.
// The visitorManager is passed a ref to the Jukebox so they can notify
// the Jukebox of new arrivals ()
const visitorManager = new VisitorManager(jukeBox, "visitors")

// Open the doors!
// A stream of test visitors is simulated by clicking the "Admit next visitor"
// button. The visitorManager listens to clicks on the "admit-visitor" element
// to present the next visitor from the sample to the visitorManager.
shuffle(visitorSample)
receiveVisitors(visitorSample, "admit-visitor", visitorManager)

// A second VisitorManager could be instated at a second venue entrance,
// like below. This VisitorManager would use a second button to admit 
// visitors at the second entrance and may use the same or a different Jukebox
// instance (e.g. 1 or 2 seperate soundsystems, eg upstairs and downstairs).
// const visitorManager2 = new VisitorManager(jukeBox, "visitors")
// receiveVisitors(visitorSample2, "admit-visitor2", visitorManager2)
