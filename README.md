Jukebox Programming Challenge
=============================
Imagine we are launching a music streaming service for cafes and restaurants.
For all visitors who come in and join the WiFi/Bluetooth network, music 
preferences are loaded and taken into account when streaming music at the 
venue. In other words, playlists are dynamically generated based on who is 
inside at the moment.

TypeScript implementation by Rik de Boer
----------------------------------------
Simply double-click the .html file for an instant demo.
Repeatedly click the "Add new visitor" button to simulate arrivals at the
venue of guests that have their favourite artists emitted from an app on
their phones.
The page will play (for a few seconds) the songs randomly picked from the
preferred artists and also show the title of the song currently played.
TypeScript cannot be run in a browser verbatim. 
However I transpiled the TypeScript code to JavaScript and it is 
the .js file that is included in the .html file.



Problem Analysis
----------------
In order to produce a solution one has to understand the problem (Agile:
the "story") first and this requires either a detailed description, or answers
to the right questions.
As they say in Agile: a story is a promise for a conversation.
Some topics I would have a conversation about with the subject matter expert
or business analyst are the following.

-- How is a visitor to the venue identified?
Do visitors have a venue-produced app on them, downloaded from the App Store
or Google Play. which locks into the Wifi and “handshakes” with the venue?

-- How do visitors’ favourite songs enter the system?
Does the app emit particular songs (chosen previously by the visitor via the
app) or favourite artists? I've gone for the latter.

-- What are the business rules around playing visitors’ songs?
I guess that you would not instantly interrupt the song currently playing by
the song belonging to the person just walking in. Although you could implement
this behaviour for special VIP visitors whose birthday it is (and play their
favourite song as they enter the room).
If every visitor can select one song and there are many visitors, then it may
be hours before your song is played, or not at all. However if there are only
a handful of visitors, then silence may set in. At that point does the system
start again from the beginning (round robin), or does it fall back on the
venue’s default playlist until new guests arrive?

-- If a visitor leaves before their song is played, should their song be taken
off the playlist?

Solution Outline
----------------
There are two processes in play:
1) an irregular stream of guests/visitors with their lists of favourite artists
2) a stream of songs played based on a playlist
The first stream affects songs to go on the playlist

TypeScript lends itself to an OO, SOLID design.
It makes sense to separate the 2 different processing concerns in 2 different
classes (Single-Responsibility Principle).
I've called these VisitorManager and Jukebox.

The VisitorManager receives a stream of visitors (entered as test data).
Visitors may arrive at irregular intervals, one at a time or in quick
succession. This process is simulated by repeatedly clicking a button on the
front-end.

The VisitorManager collects the visitor's favourite artists, displays them
on the screen and passes them to the Jukebox. The Jukebox takes note of the
artist preferences it receives, but must not interrupt the song currently
playing.
The Jukebox is careful not to play the same song twice, if an
artist appears on the favourite lists of multiple visitors.

Apart from the VisitorManager and Jukebox classes, I created a helper function
to listen to clicks on the "Admit new visitor" button to present the next
visitor from a test sample to the VisitorManager.

The Code
--------
I used statically-typed object-oriented TypeScript throughout.
The presentation layer (HTML) is segregated from the business logic (TS).
There are no script snippets or "onClicks" in the HTML code.
The only links between presentation and business logic are a few HTML
element ids. Hence the page's look & feel may be styled and prettied up
by a designer without fear of messing up the functionality.

