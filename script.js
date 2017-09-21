$(document).ready(function() {
  // materialize js
  $('.parallax').parallax();
  $('select').material_select();



  $('#submit').click(function() {
    //initiliaze strt and end address strings and transportation mode from input
    let start = document.getElementById('start').value.replace(/ /g, "+");
    let end = document.getElementById('end').value.replace(/ /g, "+");
    var modeOfTrans = $("#modeOfTrans").val();

    //initial variables
    var initialArrStartStops = [];
    var initialArrEndStops = [];
    var startStopsCheck = [];
    var endStopsCheck = [];
    var startLat = '';
    var startLng = '';
    var endLat = '';
    var endLng = '';

    //get call for start long and ltitude
    $.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${start}&key=AIzaSyA7aaXPnH_pMwVB6jl1RzzBM34CczRHRp4`, function(startMap) {
      startLat = startMap.results[0].geometry.location.lat;
      startLng = startMap.results[0].geometry.location.lng;

      //get call for start stops
      $.get(`https://transit.land/api/v1/stops?lat=${startLat}&lon=${startLng}&r=600`, function(startStops) {

        startStopsCheck.push(startStops.stops.length);


        //logic to sort out specified mode of transportation or not
        for (let i = 0; i < startStops.stops.length; i++) {
          if ((modeOfTrans.length > 0) && (modeOfTrans.includes(startStops.stops[i].served_by_vehicle_types[0]))) {
            createStartObjArray(i, startStops);
          } else if (modeOfTrans.length === 0) {
            createStartObjArray(i, startStops);
          }
        }


      });


    });

    //funcction that create array of object start positions
    function createStartObjArray(i, startStops) {
      //startStopsCheck
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

    //call to get lat nad lng of end location from input
    $.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${end}&key=AIzaSyA7aaXPnH_pMwVB6jl1RzzBM34CczRHRp4`, function(endMap) {
      endLat = endMap.results[0].geometry.location.lat;
      endLng = endMap.results[0].geometry.location.lng;

      //get call for end stops
      $.get(`https://transit.land/api/v1/stops?lat=${endLat}&lon=${endLng}&r=600`, function(endStops) {

        endStopsCheck.push(endStops.stops.length);
        console.log(startStopsCheck);
        for (let i = 0; i < endStops.stops.length; i++) {
          if ((modeOfTrans.length > 0) && (modeOfTrans.includes(endStops.stops[i].served_by_vehicle_types[0]))) {
            createEndObjArray(i, endStops);
          } else if (modeOfTrans.length === 0) {
            createEndObjArray(i, endStops);
          }
        }


        // call function to filter array to only contain stops with end points and ending location
        let filterArrStartStops = filterStartArray(initialArrStartStops, initialArrEndStops);
        //call to list out lists
        console.log(startStopsCheck);
        listOutStart(filterArrStartStops, initialArrEndStops, startStopsCheck, endStopsCheck);
        //call to map out stops
        initMap(startLat, startLng, filterArrStartStops, 15, 'yes');
      });
    });

    //funcction that creates array of object end positions
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

    //function to filter start array to only contain those with ending locations
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

    //function to filter end array to only contain those that chosen start go to
    function filterEndArray(initialArrEndStops, startObj, endStopsCheck) {
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
      listOutEnd(newArr, startObj, endStopsCheck);
      initMap(endLat, endLng, newArr, 15, 'yes');
    }

    //function to list out start stops
    function listOutStart(filterArrStartStops, initialArrEndStops, startStopsCheck, endStopsCheck) {
      console.log(startStopsCheck);
      if(startStopsCheck[0] === 0){
        let h5 = document.createElement('h5');
        let rightSide = document.getElementById('rightSide');
        $(h5).append("No local start stop within 600 meters");
        $(rightSide).append(h5);
        //button to restart
        let myOptions = document.getElementById('myOptions');
        let p = document.createElement('p');
        $(p).append(`<a id="restart" class="waves-effect waves-light btn">Start New Search</a>`);
        $(myOptions).append(p);

        $(`#restart`).click(function() {
          window.location.reload();
        });

      }
      else if(endStopsCheck[0] === 0){
        let h5 = document.createElement('h5');
        let rightSide = document.getElementById('rightSide');
        $(h5).append("No local end stop within 600 meters");
        $(rightSide).append(h5);
        //button to restart
        let myOptions = document.getElementById('myOptions');
        let p = document.createElement('p');
        $(p).append(`<a id="restart" class="waves-effect waves-light btn">Start New Search</a>`);
        $(myOptions).append(p);

        $(`#restart`).click(function() {
          window.location.reload();
        });
      }
      else if(filterArrStartStops.length === 0){
        let h5 = document.createElement('h5');
        let rightSide = document.getElementById('rightSide');
        $(h5).append("Mode of Transportation Not Available");
        $(rightSide).append(h5);
        //button to restart
        let myOptions = document.getElementById('myOptions');
        let p = document.createElement('p');
        $(p).append(`<a id="restart" class="waves-effect waves-light btn">Start New Search</a>`);
        $(myOptions).append(p);

        $(`#restart`).click(function() {
          window.location.reload();
        });
      }
      else{
      let h5 = document.createElement('h5');
      let rightSide = document.getElementById('rightSide');
      $(h5).append("Choose Start Stop");
      $(rightSide).append(h5);

      let id = 1;
      for (let i = 0; i < filterArrStartStops.length; i++) {
        let ul = document.createElement('ul');
        let li = document.createElement('li');
        let li1 = document.createElement('li');
        let li2 = document.createElement('li');
        let myOptions = document.getElementById('myOptions');

        $(li).append(`<a id="${id}">${id}. ${filterArrStartStops[i].name}</a>`);
        $(li1).append(filterArrStartStops[i].operator);
        $(li2).append(filterArrStartStops[i].mode);
        $(ul).append(li);
        $(ul).append(li1);
        $(ul).append(li2);
        $(myOptions).append(ul);


        $(`#${id}`).click(function(e) {
          let startObj = filterArrStartStops[e.target.id - 1];
          $(`#rightSide`).empty();
          $(`#myOptions`).empty();
          $(`#map`).empty();
          filterEndArray(initialArrEndStops, startObj, endStopsCheck);

        });
        id++;
      }
      }
    }

    //function to list out end stops
    function listOutEnd(filterArrEndStops, startObj, endStopsCheck) {
      if(endStopsCheck === 0){
        let h5 = document.createElement('h5');
        let rightSide = document.getElementById('rightSide');
        $(h5).append("No local end stops within 600 meters");
        $(rightSide).append(h5);
      }
      else{
      let h5 = document.createElement('h5');
      let rightSide = document.getElementById('rightSide');
      $(h5).append("Choose Ending Stop:");
      $(rightSide).append(h5);
      let id = 1;
      for (let i = 0; i < filterArrEndStops.length; i++) {
        let ul = document.createElement('ul');
        let li = document.createElement('li');
        let li1 = document.createElement('li');
        let li2 = document.createElement('li');
        let myOptions = document.getElementById('myOptions');

        $(li).append(`<a id="${id}">${id}. ${filterArrEndStops[i].name}</a>`);
        $(li1).append(filterArrEndStops[i].operator);
        $(li2).append(filterArrEndStops[i].mode);
        $(ul).append(li);
        $(ul).append(li1);
        $(ul).append(li2);
        $(myOptions).append(ul);

        $(`#${id}`).click(function(e) {
          let endObj = filterArrEndStops[e.target.id - 1];
          $(`#rightSide`).empty();
          $(`#myOptions`).empty();
          $(`#map`).empty();
          console.log(endObj);
          results(startObj, endObj);

        });
        id++;
      }
    }
    }

  });

});


//google map functions
var map;

function initMap(lat, lng, arr, zoom, addressPin) {

  var center = new google.maps.LatLng(lat, lng);
  map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: zoom
  });
  if (addressPin === 'yes') {
    var addressPosition = new google.maps.LatLng(lat, lng);
    var addressMarker = new google.maps.Marker({
      position: addressPosition,
      map: map
    })
  }
  for (let i = 0; i < arr.length; i++) {
    //console.log(arr[i].cords[0], arr[i].cords[1]);
    addMarker(arr[i].cords[0], arr[i].cords[1], i);
  }

  function addMarker(lat, lng, i) {
    var position = new google.maps.LatLng(lat, lng);
    var marker = new google.maps.Marker({
      position: position,
      map: map,
      icon: `./number_icon/number_${i+1}.png`
    })

    var infoWindow = new google.maps.InfoWindow({
      content: `<p>${i+1}. ${arr[i].name}</p>`

    });

    marker.addListener('click', function() {
      infoWindow.open(map, marker);

    })
    infoWindow.addListener('click', function() {
      console.log('hello');
    })
  }

}

//final result function
function results(startObj, endObj) {
  let h3 = document.createElement('h3');
  let h5 = document.createElement('h5');
  let p = document.createElement('p');
  let p1 = document.createElement('p1');
  $(h3).append("Get On At:");
  $(h5).append(startObj.name);
  $(p).append(startObj.operator);
  $(p1).append(startObj.mode);
  $(`#rightSide`).append(h3);
  $(`#rightSide`).append(h5);
  $(`#rightSide`).append(p);
  $(`#rightSide`).append(p1);

  let h3end = document.createElement('h3')
  let h5end = document.createElement('h5');
  let pend = document.createElement('p');
  let p1end = document.createElement('p1');
  $(h3end).append("Get Off At:");
  $(h5end).append(endObj.name);
  $(pend).append(endObj.operator);
  $(p1end).append(endObj.mode);
  $(`#myOptions`).append(h3end);
  $(`#myOptions`).append(h5end);
  $(`#myOptions`).append(pend);
  $(`#myOptions`).append(p1end);
  let resultArr = [startObj, endObj];
  initMap(((startObj.cords[0] + endObj.cords[0]) / 2), ((startObj.cords[1] + startObj.cords[1]) / 2), resultArr, 12, 'no');

  let plast = document.createElement('p');
  $(plast).append(`<a id="restart" class="waves-effect waves-light btn">Start New Search</a>`);
  $(myOptions).append(plast);

  $(`#restart`).click(function() {
    window.location.reload();
  });
}
