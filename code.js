

var dataset = ee.Image('COPERNICUS/CORINE/V20/100m/2000');
var landCover = dataset.select('landcover');
var copy2000 = landCover.clip(geometry2);
Map.addLayer(copy2000, {}, 'Kozani 2000');
print(copy2000);


// Εξαγωγή του συνδυασμένου χάρτη στο Google Drive
Export.image.toDrive({
  image: copy2000.visualize(),
  description: 'corine2000',
  scale: 75,
  region: geometry
});



// Ορίστε τη θέση του τοπονυμίου
//var location = ee.Geometry.Point(21.7924, 40.2961); // Παράδειγμα θέσης

// // Δημιουργήστε το τοπωνύμιο
// var label = ui.Label('Τοπωνύμιο εδώ', {
//   position: 'top-center', // Τοποθεσία του τοπωνυμίου στον χάρτη
//   backgroundColor: 'FFFFFF', // Χρώμα του φόντου
//   padding: '8px', // Περιθώριο
//   fontSize: '16px' // Μέγεθος γραμματοσειράς
// });

// // Προσθέστε το τοπωνύμιο στον χάρτη
// Map.add(label);

//-----------------------------------------------------------------------
// Δημιουργία εικόνας με λευκό φόντο
//var whiteBackground = ee.Image(255).toInt8().paint(geometry, 0);

// Συνδυασμός της πολυγωνικής εικόνας με το λευκό φόντο
//var finalImage = copy2000.add(whiteBackground);

// Export.image.toDrive({
//   image: copy2000.visualize(), // Χρησιμοποιήστε .visualize() για να εξάγετε την οπτική αναπαράσταση της εικόνας
//   description: 'fin2000',
//   //scale: 30,
//   region: geometry2
// });



var dataset2 = ee.Image('COPERNICUS/CORINE/V20/100m/2018');
var landCover = dataset2.select('landcover');
var copy2018 = landCover.clip(geometry2);
Map.addLayer(copy2018, {}, 'Kozani 2018');
print(copy2018);

Export.image.toDrive({
  image: copy2018.visualize(),
  description: 'corine_2018',
  scale: 75,
  region: geometry
  //maxPixels: 1e9
});


var bands = ['landcover'];
//Display classification
var visParamsClassification = {
  min: 0,
  max: 8,
  palette: [ '#83ff00','#ff0000', '#1968ff', '#9effe5', '#dda232','#7e828e','#175c0f','#1a8d0d','#68ba11']
};

//classification 2000

var classify_2000 = vegetation2000.merge(urban2000).merge(water2000).merge(roads2000).merge(agro2000).merge(minerals2000).merge(veg_311_2000).merge(veg_312_2000).merge(veg_313_2000);
//print(classify_2000);

var training = copy2000.select(bands).sampleRegions({
  collection: classify_2000,
  properties: ['landcover2'],
  scale: 75
});
//print(training);

var classifier = ee.Classifier.smileCart().train({
  features: training,
  classProperty: 'landcover2',
  inputProperties: bands
});

//Run the classification
var classified_2000= copy2000.select(bands).classify(classifier);
//print(classified_2000);

// Display the classified image.
Map.addLayer(classified_2000, visParamsClassification, 'Classification 2000');

Export.image.toDrive({
  image: classified_2000.visualize({
  min: 0,
  max: 8,
  palette: [ '#83ff00','#ff0000', '#1968ff', '#9effe5', '#dda232','#7e828e','#175c0f','#1a8d0d','#68ba11'],
}), // Χρησιμοποιήστε .visualize() για να εξάγετε την οπτική αναπαράσταση της εικόνας
  description: 'Kozani2000_classified',
  scale: 75,
  region: geometry
});

//classification 2018
var classify_2018 = vegetation.merge(urban).merge(water).merge(roads).merge(agro).merge(minerals).merge(veg_311).merge(veg_312).merge(veg_313);
//print(classify_2018);
//vegetation_now.merge(   merge(roads_now)
var bands = ['landcover'];
var training = copy2018.select(bands).sampleRegions({
  collection: classify_2018,
  properties: ['landcover1'],
  scale: 75
});
//print(training);

var classifier = ee.Classifier.smileCart().train({
  features: training,
  classProperty: 'landcover1',
  inputProperties: bands
});

//Run the classification
var classified_2018 = copy2018.select(bands).classify(classifier);
Map.addLayer(classified_2018, visParamsClassification, 'Classification 2018');


Export.image.toDrive({
  image: classified_2018.visualize({
  min: 0,
  max: 8,
  palette: [ '#83ff00','#ff0000', '#1968ff', '#9effe5', '#dda232','#7e828e','#175c0f','#1a8d0d','#68ba11'],
}), // Χρησιμοποιήστε .visualize() για να εξάγετε την οπτική αναπαράσταση της εικόνας
  description: 'Kozani2018_classified',
  scale: 75,
  region: geometry
});




//-----------------------------------------------
//ΠΙΞΕΛ ΚΑΘΕ ΚΑΤΗΓΟΡΙΑΣ ΓΙΑ ΤΗΝ ΑΡΧΙΚΗ ΕΙΚΟΝΑ 2000
var histogram_2000 = copy2000.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: copy2000.projection().nominalScale(),
  maxPixels: 1e9
});
var histogramData_2000 = ee.Dictionary(histogram_2000.get('landcover'));
print("2000",histogram_2000);

// Εκτυπώνουμε τα ονόματα των διαθέσιμων επιπέδων
var bandNames = classified_2000.bandNames();
print('Ονόματα επιπέδων:', bandNames);

var pixelCount = classified_2000.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: classified_2000.geometry(),
  scale: classified_2000.projection().nominalScale(),
  maxPixels: 1e9
});

print('Συνολικός αριθμός πίξελ:', pixelCount.get('classification'));
//ΠΙΞΕΛ ΚΑΘΕ ΚΑΤΗΓΟΡΙΑΣ
var h2000 = classified_2000.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: classified_2000.projection().nominalScale(),
  maxPixels: 1e9
});

// Ανάκτηση των δεδομένων του ιστογράμματος
var histogramData = ee.Dictionary(h2000.get('classification'));

// Εμφάνιση του ιστογράμματος
print("Ιστόγραμμα 2000:", histogramData);
//------------------------------------------------
var histogram_2018 = copy2018.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: copy2018.projection().nominalScale(),
  maxPixels: 1e9
});
var histogramData_2018 = ee.Dictionary(histogram_2018.get('classification'));
print("2018",histogram_2018);
// Εκτυπώνουμε τα ονόματα των διαθέσιμων επιπέδων
var bandNames = classified_2018.bandNames();
print('Ονόματα επιπέδων:', bandNames);

var pixelCount = classified_2018.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: classified_2018.geometry(),
  scale: classified_2018.projection().nominalScale(),
  maxPixels: 1e9
});

print('Συνολικός αριθμός πίξελ:', pixelCount.get('classification'));
//ΠΙΞΕΛ ΚΑΘΕ ΚΑΤΗΓΟΡΙΑΣ
var h2000 = classified_2018.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: classified_2018.projection().nominalScale(),
  maxPixels: 1e9
});

// Ανάκτηση των δεδομένων του ιστογράμματος
var histogramData = ee.Dictionary(h2000.get('classification'));

// Εμφάνιση του ιστογράμματος
print("Κατηγορίες 2018:", histogramData);
//--------------------------------------------


// Βρίσκουμε τον τύπο των pixel του ιστογράμματος
// var dataType_histogram_2018 = histogram_2018.get('landcover').getInfo().type;

// print('Ο τύπος δεδομένων των τιμών του ιστογράμματος για το έτος 2018 είναι: ' + dataType_histogram_2018);

// Χρησιμοποιήστε τον μειωτή countDistinct για να μετρήσετε τον αριθμό των μοναδικών τιμών (χρωμάτων)
var count = copy2000.reduceRegion({
  reducer: ee.Reducer.countDistinct(),
  geometry: geometry2,
  scale: 100, // Εδώ μπορείτε να ορίσετε την κατάλληλη κλίμακα ανάλυσης
  maxPixels: 1e9 // Εδώ μπορείτε να ορίσετε τον μέγιστο αριθμό των pixels που θέλετε να εξεταστούν
});

// Εκτυπώστε τον αριθμό των μοναδικών τιμών (χρωμάτων)
print('Αριθμός μοναδικών χρωμάτων: ', count.get('landcover'));

// Ορίστε την περιοχή ενδιαφέροντος ως το περίγραμμα της εικόνας copy2000
var roi = copy2018.geometry().bounds();


// Find the differences between the two images
var differences = classified_2000.neq(classified_2018);

var differencesVisParams = {
  palette: ['FFFFFF', 'FF0000'], // White for 0 (no difference), Red for 1 (difference)
  opacity: 0.7                  // Set opacity to make the differences overlay slightly transparent
};

// Add the differences layer to the map
Map.addLayer(differences, differencesVisParams, 'Land Cover Differences');
Export.image.toDrive({
  image: differences.visualize({
  min: 0,
  max: 1,
  palette: ['FFFFFF', 'FF0000'],
}), // Χρησιμοποιήστε .visualize() για να εξάγετε την οπτική αναπαράσταση της εικόνας
  description: 'διαφορεσ',
  scale: 75,
  region: geometry2
});
var hd = differences.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: differences.projection().nominalScale(),
  maxPixels: 1e9
});
// Ανάκτηση των δεδομένων του ιστογράμματος
var histogram = ee.Dictionary(hd.get('classification'));

// Εμφάνιση του ιστογράμματος
print("allages:", histogram);
//---------------------------------------------------------
//category 1-urban
//---------------------------------------------------

var visParams = {
  min: -1,
  max: 2,
  palette: [ '#ff0000','#fff5c2', '#000000', '#978787']
};


var mask1 = classified_2018.eq(1);
var mask2 = classified_2000.eq(1);
var unchanged= mask1.and(mask2);
var nonUrbanToUrban = mask2.subtract(mask1);

// Find the differences between the two masks
var differences = mask2.subtract(mask1);

// Find the areas where both masks have value 1
var bothMasksValue = mask1.and(mask2);

// Combine the differences and bothMasksValue1 masks to create a single image
var combinedImage = differences.add(bothMasksValue.multiply(2));

Map.addLayer(combinedImage, visParams, 'Urban');
//-->gkri=>idia 2
//-->kokkino=>ekseliksi-1
//-->maura=>auta pou eksafanistikan 1
var hAgro = combinedImage.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: combinedImage.projection().nominalScale(),
  maxPixels: 1e9
});
// Ανάκτηση των δεδομένων του ιστογράμματος
var histogramData = ee.Dictionary(hAgro.get('classification'));

// Εμφάνιση του ιστογράμματος
print("Κατηγορίες Urban:", histogramData);
Export.image.toDrive({
  image: combinedImage.visualize({
  min: -1,
  max: 2,
  palette: ['#ff0000','#fff5c2', '#000000', '#978787'],
}), // Χρησιμοποιήστε .visualize() για να εξάγετε την οπτική αναπαράσταση της εικόνας
  description: 'urban',
  scale: 75,
  region: geometry6
});

//------------------------------------------------------------
//category 0-vegetation
//---------------------------------------------------
var mask3 = classified_2018.eq(0);
//Map.addLayer(mask1, {}, 'urban-n');
var mask4 = classified_2000.eq(0);
var unchanged1= mask3.and(mask4);
var non0to0 = mask4.subtract(mask3);

// Find the differences between the two masks
var differences1 = mask4.subtract(mask3);

// Find the areas where both masks have value 1
var bothMasksValue1 = mask3.and(mask4);

// Combine the differences and bothMasksValue1 masks to create a single image
var combinedImage1 = differences1.add(bothMasksValue1.multiply(2));

Map.addLayer(combinedImage1, visParams, '0-veg');

Export.image.toDrive({
  image: combinedImage1.visualize({
  min: -1,
  max: 2,
  palette: ['#ff0000','#fff5c2', '#000000', '#978787'],
}), // Χρησιμοποιήστε .visualize() για να εξάγετε την οπτική αναπαράσταση της εικόνας
  description: 'cat-0',
  scale: 75,
  region: geometry2
});
var hveg = combinedImage1.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: combinedImage1.projection().nominalScale(),
  maxPixels: 1e9
});
// Ανάκτηση των δεδομένων του ιστογράμματος
var histogramData1 = ee.Dictionary(hveg.get('classification'));

// Εμφάνιση του ιστογράμματος
print("Κατηγορίες veg:", histogramData1);
//---------------------------------------------------------
//category 2-water
//---------------------------------------------------
var mask5 = classified_2018.eq(2);
//Map.addLayer(mask1, {}, 'urban-n');
var mask6 = classified_2000.eq(2);
var unchanged2= mask5.and(mask6);
var nonWatertoWater = mask6.subtract(mask5);

// Find the differences between the two masks
var differences2 = mask6.subtract(mask5);

// Find the areas where both masks have value 1
var bothMasksValue2 = mask5.and(mask6);

// Combine the differences and bothMasksValue1 masks to create a single image
var combinedImage2 = differences2.add(bothMasksValue2.multiply(2));

Map.addLayer(combinedImage2, visParams, '2-water');

var hwater = combinedImage2.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: combinedImage2.projection().nominalScale(),
  maxPixels: 1e9
});
// Ανάκτηση των δεδομένων του ιστογράμματος
var histogramData2 = ee.Dictionary(hwater.get('classification'));

// Εμφάνιση του ιστογράμματος
print("Κατηγορίες water:", histogramData2);


Export.image.toDrive({
  image: combinedImage2.visualize({
  min: -1,
  max: 2,
  palette: ['#ff0000','#fff5c2', '#000000', '#978787'],
}), // Χρησιμοποιήστε .visualize() για να εξάγετε την οπτική αναπαράσταση της εικόνας
  description: 'cat-2',
  scale: 75,
  region: geometry5
});

//---------------------------------------------------------
//category 3-roads
//---------------------------------------------------
var mask7 = classified_2018.eq(3);
//Map.addLayer(mask1, {}, 'urban-n');
var mask8 = classified_2000.eq(3);
var unchanged3= mask7.and(mask8);
var non3to3 = mask8.subtract(mask7);

// Find the differences between the two masks
var differences3 = mask8.subtract(mask7);

// Find the areas where both masks have value 1
var bothMasksValue3 = mask7.and(mask8);

// Combine the differences and bothMasksValue1 masks to create a single image
var combinedImage3 = differences3.add(bothMasksValue3.multiply(2));
Map.addLayer(combinedImage3, visParams, '3-roads');

var hroads = combinedImage3.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: combinedImage3.projection().nominalScale(),
  maxPixels: 1e9
});
// Ανάκτηση των δεδομένων του ιστογράμματος
var histogramData3 = ee.Dictionary(hroads.get('classification'));

// Εμφάνιση του ιστογράμματος
print("Κατηγορίες roads:", histogramData3);
// Export.image.toDrive({
//   image: combinedImage3.visualize({
//   min: -1,
//   max: 2,
//   palette: ['#ff0000','#fff5c2', '#000000', '#978787'],
// }), // Χρησιμοποιήστε .visualize() για να εξάγετε την οπτική αναπαράσταση της εικόνας
//   description: 'cat-3',
//   scale: 75,
//   region: geometry2
// });


//---------------------------------------------------------
//category 4-agro
//---------------------------------------------------
var mask9 = classified_2018.eq(4);
//Map.addLayer(mask1, {}, 'urban-n');
var mask10 = classified_2000.eq(4);
var unchanged4= mask9.and(mask10);
var nonAgrotoAgro = mask10.subtract(mask9);

// Find the differences between the two masks
var differences4 = mask10.subtract(mask9);

// Find the areas where both masks have value 1
var bothMasksValue4 = mask9.and(mask10);

// Combine the differences and bothMasksValue1 masks to create a single image
var combinedImage4 = differences4.add(bothMasksValue4.multiply(2));
Map.addLayer(combinedImage4, visParams, '4-Agro');

Export.image.toDrive({
  image: combinedImage4.visualize({
  min: -1,
  max: 2,
  palette: ['#ff0000','#fff5c2', '#000000', '#978787'],
}), // Χρησιμοποιήστε .visualize() για να εξάγετε την οπτική αναπαράσταση της εικόνας
  description: 'agro',
  scale: 75,
  region: geometry6
});

var hAgro = combinedImage4.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: combinedImage4.projection().nominalScale()
 // maxPixels: 1e9
});
// Ανάκτηση των δεδομένων του ιστογράμματος
var histogramData = ee.Dictionary(hAgro.get('classification'));

// Εμφάνιση του ιστογράμματος
print("Κατηγορίες Agro:", histogramData);



//---------------------------------------------------------
//category 5-eksoriksiOriktwn
//---------------------------------------------------
var mask11 = classified_2018.eq(5);
//Map.addLayer(mask1, {}, 'urban-n');
var mask12 = classified_2000.eq(5);
//var unchanged5= mask11.and(mask12);
//var nonMintoMin = mask12.subtract(mask11);

// Find the differences between the two masks
var differences5 = mask12.subtract(mask11);

// Find the areas where both masks have value 1
var bothMasksValue5 = mask11.and(mask12);

// Combine the differences and bothMasksValue1 masks to create a single image
var combinedImage5 = differences5.add(bothMasksValue5.multiply(2));
Map.addLayer(combinedImage5, visParams, '5-Minerals');

var hEks = combinedImage5.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: combinedImage5.projection().nominalScale()
 // maxPixels: 1e9
});
// Ανάκτηση των δεδομένων του ιστογράμματος
var histogramData5 = ee.Dictionary(hEks.get('classification'));

// Εμφάνιση του ιστογράμματος
print("Κατηγορίες Eks:", histogramData5);

Export.image.toDrive({
  image: combinedImage5.visualize({
  min: -1,
  max: 2,
  palette: ['#ff0000','#fff5c2', '#000000', '#978787'],
}), // Χρησιμοποιήστε .visualize() για να εξάγετε την οπτική αναπαράσταση της εικόνας
  description: '6-veg311',
  scale: 75,
  region: geometry
});
//---------------------------------------------------------
//category 6-veg311
//---------------------------------------------------
var mask13 = classified_2018.eq(6);
//Map.addLayer(mask1, {}, 'urban-n');
var mask14 = classified_2000.eq(6);
//var unchanged5= mask11.and(mask12);
//var nonMintoMin = mask12.subtract(mask11);

// Find the differences between the two masks
var differences6 = mask14.subtract(mask13);

// Find the areas where both masks have value 1
var bothMasksValue6 = mask13.and(mask14);

// Combine the differences and bothMasksValue1 masks to create a single image
var combinedImage6 = differences6.add(bothMasksValue6.multiply(2));
Map.addLayer(combinedImage6, visParams, '6-veg311');

Export.image.toDrive({
  image: combinedImage6.visualize({
  min: -1,
  max: 2,
  palette: ['#ff0000','#fff5c2', '#000000', '#978787'],
}), // Χρησιμοποιήστε .visualize() για να εξάγετε την οπτική αναπαράσταση της εικόνας
  description: '6-veg311',
  scale: 75,
  region: geometry2
});
var hveg311 = combinedImage6.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: combinedImage6.projection().nominalScale(),
  maxPixels: 1e9
});
// Ανάκτηση των δεδομένων του ιστογράμματος
var histogramData6 = ee.Dictionary(hveg311.get('classification'));

// Εμφάνιση του ιστογράμματος
print("Κατηγορίες veg311:", histogramData6);
//---------------------------------------------------------
//category 7-veg312
//---------------------------------------------------
var mask15 = classified_2018.eq(7);
//Map.addLayer(mask1, {}, 'urban-n');
var mask16 = classified_2000.eq(7);
//var unchanged5= mask11.and(mask12);
//var nonMintoMin = mask12.subtract(mask11);

// Find the differences between the two masks
var differences7 = mask16.subtract(mask15);

// Find the areas where both masks have value 1
var bothMasksValue7 = mask15.and(mask16);

// Combine the differences and bothMasksValue1 masks to create a single image
var combinedImage7 = differences7.add(bothMasksValue7.multiply(2));
Map.addLayer(combinedImage7, visParams, '7-veg312');

Export.image.toDrive({
  image: combinedImage7.visualize({
  min: -1,
  max: 2,
  palette: ['#ff0000','#fff5c2', '#000000', '#978787'],
}), // Χρησιμοποιήστε .visualize() για να εξάγετε την οπτική αναπαράσταση της εικόνας
  description: '7-veg312',
  scale: 75,
  region: geometry2
});
var hveg312 = combinedImage7.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: combinedImage7.projection().nominalScale(),
  maxPixels: 1e9
});
// Ανάκτηση των δεδομένων του ιστογράμματος
var histogramData7 = ee.Dictionary(hveg312.get('classification'));

// Εμφάνιση του ιστογράμματος
print("Κατηγορίες veg312:", histogramData7);
//---------------------------------------------------------
//category 8-veg313
//---------------------------------------------------
var mask15 = classified_2018.eq(8);
//Map.addLayer(mask1, {}, 'urban-n');
var mask16 = classified_2000.eq(8);
//var unchanged5= mask11.and(mask12);
//var nonMintoMin = mask12.subtract(mask11);

// Find the differences between the two masks
var differences8 = mask16.subtract(mask15);

// Find the areas where both masks have value 1
var bothMasksValue8 = mask15.and(mask16);

// Combine the differences and bothMasksValue1 masks to create a single image
var combinedImage8 = differences8.add(bothMasksValue8.multiply(2));
Map.addLayer(combinedImage8, visParams, '8-veg313');

Export.image.toDrive({
  image: combinedImage8.visualize({
  min: -1,
  max: 2,
  palette: ['#ff0000','#fff5c2', '#000000', '#978787'],
}), // Χρησιμοποιήστε .visualize() για να εξάγετε την οπτική αναπαράσταση της εικόνας
  description: '8-veg313',
  scale: 75,
  region: geometry2
});
var hveg313 = combinedImage8.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: geometry2,
  scale: combinedImage8.projection().nominalScale(),
  maxPixels: 1e9
});
// Ανάκτηση των δεδομένων του ιστογράμματος
var histogramData8 = ee.Dictionary(hveg313.get('classification'));

// Εμφάνιση του ιστογράμματος
print("Κατηγορίες veg313:", histogramData8);


var images = [copy2000, copy2018]; // Εδώ προσθέστε τις εικόνες που θέλετε να χρησιμοποιήσετε.

// Ενώστε τις εικόνες σαν bands.
var stacked = ee.ImageCollection.fromImages(images).toBands();

// Οπτικοποιήστε το Image Collection ως GIF.
var gif = stacked.visualize(1, { format: 'GIF', size: 500 });

// Εξαγάγετε το GIF στο Google Drive.
Export.video.toDrive({
  collection: ee.ImageCollection([gif]),
  description: 'my_gif',
  dimensions: 500,
  framesPerSecond: 4
});


print(ui.Thumbnail({image: gif}));



//Define GIF visualization arguments.
var gifParams = {
  'region': geometry2,
  'dimensions': 800,
  'framesPerSecond': 2,
  'format': 'gif'
};

//Labeling your images.
var annotations = [{
  position: 'bottom',
  offset: '10%',
  margin: '20%',
  property: 'year',
  scale: 6000
  }];
  







// // Δημιουργήστε μια εικόνα με λευκό φόντο
// var whiteBackground = ee.Image(255).toInt8().paint(geometry2, 0);

// // Συνδυάστε την πολυγωνική εικόνα με το λευκό φόντο
// var finalImage = classified_2000.visualize({
//   min: 0,
//   max: 8,
//   palette: ['#83ff00', '#ff0000', '#1968ff', '#9effe5', '#dda232', '#7e828e', '#1b6c12', '#239316', '#3ccc34']
// }).blend(whiteBackground);

// // Εξαγωγή της τελικής εικόνας στο Google Drive
// Export.image.toDrive({
//   image: finalImage,
//   description: 'classified_with_white_background',
//   scale: 30,
//   region: geometry2
// });





// // // Επιλογή της εικόνας προς εξαγωγή (combinedImage)
// // var imageToExport = combinedImage;

// // // Καθορισμός των παραμέτρων για την εξαγωγή
// // var exportParams = {
// //   image: imageToExport,
// //   description: 'combined_image_export', // Περιγραφή του αρχείου που θα δημιουργηθεί
// //   folder: 'your_folder_name', // Όνομα του φακέλου στο Google Drive
// //   scale: 100, // Ανάλυση
// //   region: geometry2, // Περιοχή εξαγωγής (Geometry ή Feature)
// //   maxPixels: 1e9 // Μέγιστος αριθμός πίξελ που επιτρέπεται
// // };

// // // Επιλογή της εικόνας προς εξαγωγή (combinedImage)
// // var imageToExport = combinedImage;

// // // Καθορισμός των παραμέτρων για την εξαγωγή
// // var exportParams = {
// //   image: imageToExport,
// //   description: 'combined_image_export', // Περιγραφή του αρχείου που θα δημιουργηθεί
// //   folder: 'your_folder_name', // Όνομα του φακέλου στο Google Drive
// //   scale: 100, // Ανάλυση
// //   region: geometry, // Περιοχή εξαγωγής (Geometry ή Feature)
// //   maxPixels: 1e9 // Μέγιστος αριθμός πίξελ που επιτρέπεται
// // };

// // // Εκκίνηση της διαδικασίας εξαγωγής
// // Export.image.toDrive(exportParams);

// // Περιμένουμε μέχρι να ολοκληρωθεί η διαδικασία εξαγωγής
// print('Exporting image...');

// // Πάρτε το URL για να κατεβάσετε τη συνδυασμένη εικόνα
// var downloadUrl = combinedImage.getDownloadURL({
//   name: 'combined_image', // Όνομα του αρχείου που θα κατεβάσετε
//   scale: 100, // Ανάλυση
//   region: geometry2 // Περιοχή εξαγωγής (Geometry ή Feature)
// });

// // Εμφάνιση του URL στην κονσόλα για χρήση
// print('Download URL:', downloadUrl);
// Εκκίνηση της διαδικασίας εξαγωγής
//Export.image.toDrive(exportParams);


// Add the blended image to the map
//Map.addLayer(blendedVis, {}, 'Blended Image');


//Map.addLayer(combinedImage, visParams, 'Συνδυασμένη Εικόνα');

//mauro->ekseliksi
//aspro->to antitheto

// Add the mask showing non-urban to urban change (category 1)
//Map.addLayer(nonUrbanToUrban.updateMask(nonUrbanToUrban).add(mask1), {}, 'hhhhhhhh');

// var mask1 = classified_2018.eq(1);
// var mask2 = classified_2000.eq(1);

// var nonUrbanToUrban = mask2.subtract(mask1);
// var unchangedUrban = mask1.and(mask2);

// // Add the mask showing urban to non-urban change (category 1)
// Map.addLayer(mask1.updateMask(mask1), {palette: 'FF0000'}, 'Urban (2018)');

// // Add the mask showing non-urban to urban change (category 1)
// Map.addLayer(nonUrbanToUrban.updateMask(nonUrbanToUrban), {palette: 'red'}, 'Non-Urban to Urban');

// // Add the unchanged urban pixels (category 1)
// Map.addLayer(unchangedUrban.updateMask(unchangedUrban), {palette: 'green'}, 'Unchanged Urban');


// // Create a combined mask that shows unchanged urban pixels in green
// var combinedMask = unchangedUrban.multiply(2).add(nonUrbanToUrban).add(mask1);

// var visParamsCombined = {
//   min: 0,
//   max: 4,
//   palette: ['green', 'blue', 'red','white'] // Green for unchanged urban, blue for non-urban to urban, red for urban 2018
// };

// Map.addLayer(combinedMask, visParamsCombined, 'Combined Mask');

//Map.addLayer(.updateMask(nonUrbanToUrban.not()).updateMask().updateMask(mask1), unchangedUrbanVisParams, 'Unchanged Urban Areas');
// var mask3 = classified_2018.eq(0);
// //Map.addLayer(mask1, {}, 'urban-n');
// var mask4 = classified_2000.eq(0);

// var nonVegToVeg = mask4.subtract(mask3);
// Map.addLayer(nonVegToVeg, {}, 'Non-Veg to Veg');
// //mauro->ekseliksi
// //aspro->to antitheto
// var mask5 = classified_2018.eq(2);
// var mask6 = classified_2000.eq(2);

// var nonWaterToWater = mask6.subtract(mask5);
// Map.addLayer(nonWaterToWater, {}, 'NonWaterToWater');

// var mask7 = classified_2018.eq(3);
// var mask8 = classified_2000.eq(3);

// var nonRoadToRoad = mask8.subtract(mask7);
// Map.addLayer(nonRoadToRoad, {}, 'NonRoadToRoad');

