# JSON-to-CSV converter

This is a stand alone NodeJS script that flattens a JSON file to CSV format. It does not require a schema definition a priori. However, it does assume that the JSON file is of consistent format throughout. If not, the produced CSV will be wrong.

More details <a href="http://yelkhatib.tumblr.com/post/51147153670/converting-json-to-csv">here</a>.

## Usage:
    node convertJsonToCsv.js /path/to/input/file.json

Produced CSV will be pushed to stdout.
