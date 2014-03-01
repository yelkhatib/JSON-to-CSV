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
    var parsedJson = JSON.parse(fileContents);
	
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
	var sumOfCollections = 1;	// default number of collections
	for (key in collections) {
		sumOfCollections += collections[key];
	}
	numberOfRows *= sumOfCollections;
	console.log("rows: "+numberOfRows+" cols: "+numberOfCols+" collections: "+sumOfCollections);
	var rowNumber=0,
	    pathsArr = new Array(),
	    csvHeader = new Array(numberOfCols+1);
	    csv = new Array(numberOfRows);
	for (var i=0; i<=numberOfRows; i++) {
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
	outputWidth = 0;
	for (var j=0; j<numberOfCols; j++) {
		if (csvHeader[j]){
			outputHeader += csvHeader[j]+sep;
			outputWidth++;
		}
	}
	outputHeader += csvHeader[j];
	console.log(outputHeader);
	for (var i=0; i<=numberOfRows; i++) {
		var outputRow = "";
		for (var j=0; j<outputWidth; j++) {
			leaf = leaves[i*outputWidth + j];
			if( (typeof leaf == "object") && (leaf !== null) )
				leaf = "";
			outputRow += leaf + sep;
		}
		console.log(outputRow+leaves[i*outputWidth + j]);
	}
	
  });
}

parseResults(process.argv[2]);
