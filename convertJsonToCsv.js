var fs = require("fs"),
    traverse = require('traverse');

const sep = ',';

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isCollection(k) {
	var flag = false;
	for (var i=0; i<k.length; i++)
		flag = flag || isNumber(k[0]);
	return flag;
}

function parseResults(filename) {
  fs.readFile(filename, 'utf-8', function (err, fileContents) {
    if (err) throw err;
    var parsedJson = JSON.parse(fileContents).tests;
	
	var numberOfRows = 0,
		numberOfCols = 0,
		collections = new Array(),
		collectionLevels = new Array();

	traverse(parsedJson).forEach(function (x) {
		if (this.isRoot) {
			numberOfRows = this.keys.length;
		} else {
			if (!this.isChild) {
				if (this.keys) {
					if (isCollection(this.keys)) {
						collections[this.key]=this.keys.length;
						if (collectionLevels.indexOf(this.level) < 0)
							collectionLevels.push(this.level);
					}
				}
			}
			if (numberOfCols<this.level)
				numberOfCols = this.level;
		}
	});
	var sumOfCollections = 0;
	for (key in collections) {
		sumOfCollections += collections[key];
	}
	numberOfRows *= sumOfCollections;
	console.log("rows: "+numberOfRows+" cols: "+numberOfCols+" collections: "+sumOfCollections);
	var rowNumber=0,
	    pathsArr = new Array(),
	    csvHeader = new Array(numberOfCols+1);
	    csv = new Array(numberOfRows);
	for (var i=0; i<numberOfRows; i++) {
		csv[i] = new Array(numberOfCols+1);
	}

	var leaves = traverse(parsedJson).reduce(function (acc, x) {
	    if (this.isLeaf) {
			acc.push(x);
			if (isNaN(pathsArr[this.parent.path]))
				pathsArr[this.parent.path]=0;
			else
				pathsArr[this.parent.path]++;
			var colNumber = pathsArr[this.parent.path]+this.level-1;
			csvHeader[colNumber] = this.key;
			//csvHeader.push(this.key);
			csv[rowNumber][colNumber] = x;
	    } else {
			if (isNumber(this.path[0])) {
				rowNumber = parseFloat(this.path[0])*sumOfCollections;
				for (x in collectionLevels) {
					var collectionLevel = collectionLevels[x];
					if (isNumber(this.path[collectionLevel]))
						rowNumber += parseFloat(this.path[collectionLevel]);
				}
			}
	    }
	    return acc;
	}, []);

	var outputHeader = "";
	for (var j=0; j<=numberOfCols; j++) {
		if (csvHeader[j])
			outputHeader += csvHeader[j]+sep;
	}
	console.log(outputHeader);
	
	var lastRowValues = new Array(numberOfCols);
	for (var i=0; i<numberOfRows; i++) {
		var outputRow = "";
		for (var j=1; j<=numberOfCols; j++) {
			if (csv[i][j]) {
				lastRowValues[j] = csv[i][j];
			} else {
				csv[i][j] = lastRowValues[j];
			}
			outputRow += csv[i][j]+sep;
		}
		console.log(outputRow);
	}
	//console.dir(leaves);
  });
}

parseResults(process.argv[2]);
