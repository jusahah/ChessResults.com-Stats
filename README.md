# ChessResults.com-Stats
Generates various statistics out of ChessResults.com crosstables.

### How does it work?

It takes in URL pointing to a tournaments cross-table results page. For example, URL like this: [http://chess-results.com/tnr230983.aspx?lan=18&art=4&fed=FIN&turdet=YES&wi=821](http://chess-results.com/tnr230983.aspx?lan=18&art=4&fed=FIN&turdet=YES&wi=821)

Then the script fetches the HTML, parses from it player results, and transforms to various stats.

*At the moment only one statistic is supported:* **bestUpsets.js** which lists top five upsets (based on rating diff) from the tournament.

Pretty easy to add new statistics generators. 

## MIT licence and so on.
