$(document).ready(function() {
  // // materialize js
  // $('.parallax').parallax();
  // $('select').material_select();


  //$('#submit').click(function() {
  //initiliaze strt and end address strings
  let start = '3048+16th+Street+San+Francisco+CA';
  let end = 'One+Ferry+Building+San+Francisco+CA';
  var modeOfTrans = ['bus'];
  var initialArrStartStops = [];
  var initialArrEndStops = [];

//done------------------------------



  //get call for start long and ltitude
  $.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${start}&key=AIzaSyA7aaXPnH_pMwVB6jl1RzzBM34CczRHRp4`, function(startMap) {
    let startLat = startMap.results[0].geometry.location.lat;
    let startLng = startMap.results[0].geometry.location.lng;

    //get call for start stops
    $.get(`https://transit.land/api/v1/stops?lat=${startLat}&lon=${startLng}&r=600`, function(startStops) {
      //heading for choosing start
      let h5 = document.createElement('h5');
      let rightSide = document.getElementById('rightSide');
      $(h5).append("Choose Starting Stop:");
      $(rightSide).append(h5);

      for (let i = 0; i < startStops.stops.length; i++) {
        if ((modeOfTrans.length > 0) && (modeOfTrans.includes(startStops.stops[i].served_by_vehicle_types[0]))) {
          createStartObjArray(i, startStops);
        } else if (modeOfTrans.length === 0) {
          createStartObjArray(i, startStops);
        }

      }

    });


  });


  function createStartObjArray(i, startStops) {

    let arr = [];
    for (let x = 0; x < startStops.stops[i].routes_serving_stop.length; x++) {
      arr.push(startStops.stops[i].routes_serving_stop[x].route_name);
    }
    initialArrStartStops.push({
      name: startStops.stops[i].name,
      operator: startStops.stops[i].operators_serving_stop[0].operator_name,
      mode: startStops.stops[i].served_by_vehicle_types[0],
      cords: [startStops.stops[i].geometry.coordinates[1], startStops.stops[i].geometry.coordinates[0]],
      routeNames: arr
    });

  }

  $.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${end}&key=AIzaSyA7aaXPnH_pMwVB6jl1RzzBM34CczRHRp4`, function(endMap) {
    let endLat = endMap.results[0].geometry.location.lat;
    let endLng = endMap.results[0].geometry.location.lng;

    //get call for end stops
    $.get(`https://transit.land/api/v1/stops?lat=${endLat}&lon=${endLng}&r=600`, function(endStops) {
      //heading for choosing start
      let h5 = document.createElement('h5');
      let rightSide = document.getElementById('rightSide');
      $(h5).append("Choose Ending Stop:");
      $(rightSide).append(h5);

      for (let i = 0; i < endStops.stops.length; i++) {
        if ((modeOfTrans.length > 0) && (modeOfTrans.includes(endStops.stops[i].served_by_vehicle_types[0]))) {
          createEndObjArray(i, endStops);
        } else if (modeOfTrans.length === 0) {
          createEndObjArray(i, endStops);
        }

      }

      let filterArrStartStops = filterStartArray(initialArrStartStops, initialArrEndStops);
      listOutStart(filterArrStartStops);
      //call listing function function()
      let startObj = filterArrStartStops[3];
      let filterArrEndStops = filterEndArray(initialArrEndStops, startObj);




    });


  });

  function createEndObjArray(i, endStops) {

    let arr = [];
    for (let x = 0; x < endStops.stops[i].routes_serving_stop.length; x++) {
      arr.push(endStops.stops[i].routes_serving_stop[x].route_name);
    }
    initialArrEndStops.push({
      name: endStops.stops[i].name,
      operator: endStops.stops[i].operators_serving_stop[0].operator_name,
      mode: endStops.stops[i].served_by_vehicle_types[0],
      cords: [endStops.stops[i].geometry.coordinates[1], endStops.stops[i].geometry.coordinates[0]],
      routeNames: arr
    });

  }



});

function filterStartArray(initialArrStartStops, initialArrEndStops) {
  let newArr = [];

  for (let i = 0; i < initialArrEndStops.length; i++) {
    for (let x = 0; x < initialArrEndStops[i].routeNames.length; x++) {
      checkStart(initialArrEndStops[i].routeNames[x]);
    }
  }

  function checkStart(routeN) {
    for (let k = 0; k < initialArrStartStops.length; k++) {
      if (initialArrStartStops[k].routeNames.includes(routeN) && !(newArr.includes(initialArrStartStops[k]))) {
        newArr.push(initialArrStartStops[k]);
      }
    }
  }

  return newArr;
}

function filterEndArray(initialArrEndStops, startObj) {
  let newArr = [];
  for (let l = 0; l < startObj.routeNames.length; l++) {
    checkEnd(startObj.routeNames[l])
  }

  function checkEnd(routeN) {
    for (let i = 0; i < initialArrEndStops.length; i++) {
      if (initialArrEndStops[i].routeNames.includes(routeN) && !(newArr.includes(initialArrEndStops[i]))) {
        newArr.push(initialArrEndStops[i]);
      }
    }

  }
return newArr;
}

function listOutStart(filterArrStartStops){
  console.log(filterArrStartStops);
}

// var map;
//
// function initMap(lat, lng, arr, zoom, addressPin) {
//
//   var center = new google.maps.LatLng(lat, lng);
//   map = new google.maps.Map(document.getElementById('map'), {
//     center: center,
//     zoom: zoom
//   });
//   if (addressPin === 'yes') {
//     var addressPosition = new google.maps.LatLng(lat, lng);
//     var addressMarker = new google.maps.Marker({
//       position: addressPosition,
//       map: map
//     })
//   }
//   for (let i = 0; i < arr.length; i++) {
//     //console.log(arr[i].cords[0], arr[i].cords[1]);
//     addMarker(arr[i].cords[0], arr[i].cords[1], i);
//   }
//
//   function addMarker(lat, lng, i) {
//     var position = new google.maps.LatLng(lat, lng);
//     var marker = new google.maps.Marker({
//       position: position,
//       map: map,
//       icon: `./number_icon/number_${i+1}.png`
//     })
//
//     var infoWindow = new google.maps.InfoWindow({
//       content: `<p>${i+1}. ${arr[i].name}</p>`
//
//     });
//
//     marker.addListener('click', function() {
//       infoWindow.open(map, marker);
//
//     })
//     infoWindow.addListener('click', function() {
//       console.log('hello');
//     })
//   }
//
//
//
// }
//
// function results(startObj, endObj) {
//   let h3 = document.createElement('h3');
//   let h5 = document.createElement('h5');
//   let p = document.createElement('p');
//   let p1 = document.createElement('p1');
//   $(h3).append("Get On At:");
//   $(h5).append(startObj.name);
//   $(p).append(startObj.operator);
//   $(p1).append(startObj.mode);
//   $(`#rightSide`).append(h3);
//   $(`#rightSide`).append(h5);
//   $(`#rightSide`).append(p);
//   $(`#rightSide`).append(p1);
//
//   let h3end = document.createElement('h3')
//   let h5end = document.createElement('h5');
//   let pend = document.createElement('p');
//   let p1end = document.createElement('p1');
//   $(h3end).append("Get Off At:");
//   $(h5end).append(endObj.name);
//   $(pend).append(endObj.operator);
//   $(p1end).append(endObj.mode);
//   $(`#myOptions`).append(h3end);
//   $(`#myOptions`).append(h5end);
//   $(`#myOptions`).append(pend);
//   $(`#myOptions`).append(p1end);
//   let resultArr = [startObj, endObj];
//   initMap(((startObj.cords[0] + endObj.cords[0]) / 2), ((startObj.cords[1] + startObj.cords[1]) / 2), resultArr, 12, 'no');
//
//
//
// }
