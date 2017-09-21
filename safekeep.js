$(document).ready(function() {

  // materialize js
  $('.parallax').parallax();
  $('select').material_select();


  // $('#submit').click(function() {
  //   //initiliaze strt and end address strings
  //   let start = document.getElementById('start').value.replace(/ /g, "+");
  //   let end = document.getElementById('end').value.replace(/ /g, "+");
  //   var modeOfTrans = $("#modeOfTrans").val();
  //   console.log(modeOfTrans);

    //get call for start long and ltitude
    // $.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${start}&key=AIzaSyA7aaXPnH_pMwVB6jl1RzzBM34CczRHRp4`, function(startMap) {
    //   var startLat = startMap.results[0].geometry.location.lat;
    //   var startLng = startMap.results[0].geometry.location.lng;

      //get call for start stops
      // $.get(`https://transit.land/api/v1/stops?lat=${startLat}&lon=${startLng}&r=600`, function(startStops) {

        // //heading for choosing start
        // let h5 = document.createElement('h5');
        // let rightSide = document.getElementById('rightSide');
        // $(h5).append("Choose Starting Stop:");
        // $(rightSide).append(h5);
        var arrStops = [];
        var id = 1;
        var endId = 1;

        //for loop to sort though each stop
        for (let i = 0; i < startStops.stops.length; i++) {
          if(modeOfTrans.length > 0){
            for(let x = 0; x < modeOfTrans.length; x++){
              if(modeOfTrans[x] !== startStops.stops[i].served_by_vehicle_types[0]){
                //do nothing
              }
              else{
                //run code add logic for reverse search
                startList();
              }
            }
          }
          else{
            //run code add logic for reverse search
            startList();
          }


          function startList(){
            $.get(`https://transit.land/api/v1/stops?lat=${endLat}&lon=${endLng}&r=600`, function(endRoutes){
              for(let w = 0; w < endRoutes.results.length; w++){

              }
            });


          let ul = document.createElement('ul');
          let li = document.createElement('li');
          let li1 = document.createElement('li');
          let li2 = document.createElement('li');
          let myOptions = document.getElementById('myOptions');

          //push each stop object to array
          let arr = [];
          for(let z = 0; z < startStops.stops[i].routes_serving_stop.length; z++){
            arr.push(startStops.stops[i].routes_serving_stop[z].route_name);
          }

          arrStops.push({
            name: startStops.stops[i].name,
            operator: startStops.stops[i].operators_serving_stop[0].operator_name,
            mode: startStops.stops[i].served_by_vehicle_types[0],
            cords: [startStops.stops[i].geometry.coordinates[1], startStops.stops[i].geometry.coordinates[0]],
            routeNames: arr
          });

          //append each stop to page
          $(li).append(`<a id="${id}">${id}. ${startStops.stops[i].name}</a>`);
          $(li1).append(startStops.stops[i].operators_serving_stop[0].operator_name);
          $(li2).append(startStops.stops[i].served_by_vehicle_types[0]);
          $(ul).append(li);
          $(ul).append(li1);
          $(ul).append(li2);
          $(myOptions).append(ul);

          //add click function to each stop
          $(`#${id}`).click(function(e) {
            var startObj = arrStops[e.target.id-1]
            console.log(startObj);
            $(`#rightSide`).empty();
            $(`#myOptions`).empty();
            $(`#map`).empty();

            //get long and lat for endpoint
            $.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${end}&key=AIzaSyA7aaXPnH_pMwVB6jl1RzzBM34CczRHRp4`, function(endMap) {
              var endLat = endMap.results[0].geometry.location.lat;
              var endLng = endMap.results[0].geometry.location.lng;
              //search stops for end point
              $.get(`https://transit.land/api/v1/stops?lat=${endLat}&lon=${endLng}&r=600`, function(endStops) {

                //initiliaze heder for choosing end point
                let h5 = document.createElement('h5');
                let rightSide = document.getElementById('rightSide');
                $(h5).append("Choose Ending Stop:");
                $(rightSide).append(h5);
                var arrEndStops = [];


                //sort through stops for end point
                for (let j = 0; j < endStops.stops.length; j++) {
                  if(startObj.mode === endStops.stops[j].served_by_vehicle_types[0] && startObj.operator === endStops.stops[j].operators_serving_stop[0].operator_name){




                    for(let k = 0; k < endStops.stops[j].routes_serving_stop.length; k++){
                      console.log(arrEndStops.filter((item)=>item.name === endStops.stops[j].name).length === 0);
                      if(startObj.routeNames.includes(endStops.stops[j].routes_serving_stop[k].route_name)  && arrEndStops.filter((item)=>item.name === endStops.stops[j].name).length === 0){


                  let ul = document.createElement('ul');
                  let li = document.createElement('li');
                  let li1 = document.createElement('li');
                  let li2 = document.createElement('li');
                  let myOptions = document.getElementById('myOptions');

                  //push end points to array
                  arrEndStops.push({
                    name: endStops.stops[j].name,
                    operator: endStops.stops[j].operators_serving_stop[0].operator_name,
                    mode: endStops.stops[j].served_by_vehicle_types[0],
                    cords: [endStops.stops[j].geometry.coordinates[1], endStops.stops[j].geometry.coordinates[0]]
                  });


                  //append end points to body
                  $(li).append(`<a id="${endId}">${endId}. ${endStops.stops[j].name}</a>`);
                  $(li1).append(endStops.stops[j].operators_serving_stop[0].operator_name);
                  $(li2).append(endStops.stops[j].served_by_vehicle_types[0]);
                  $(ul).append(li);
                  $(ul).append(li1);
                  $(ul).append(li2);
                  $(myOptions).append(ul);

                  $(`#${endId}`).click(function(e) {
                    $(`#rightSide`).empty();
                    $(`#myOptions`).empty();
                    $(`#map`).empty();
                    results(startObj, arrEndStops[e.target.id-1])

                  })
                  endId = endId + 1;
                }
              }
                }
                else{
                  //do nothing
                }


                }
                //get mp for ending stops
                console.log(arrEndStops);
                initMap(endLat, endLng, arrEndStops, 15, 'yes');
              });






            });



          });


          id = id + 1;
        }
        //get map for starting stops
        //console.log(arrStops);
        initMap(startLat, startLng, arrStops, 15, 'yes');
      }
      });
    });
  });
});

var map;

function initMap(lat, lng, arr, zoom, addressPin) {

  var center = new google.maps.LatLng(lat, lng);
  map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: zoom
  });
  if(addressPin === 'yes'){
  var addressPosition = new google.maps.LatLng(lat,lng);
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

    marker.addListener('click',function(){
      infoWindow.open(map, marker);

    })
    infoWindow.addListener('click',function(){
      console.log('hello');
    })
  }



}

function results(startObj, endObj){
let h3 = document.createElement('h3');
let h5 = document.createElement('h5');
let p  = document.createElement('p');
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
let pend  = document.createElement('p');
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
initMap(((startObj.cords[0]+endObj.cords[0])/2), ((startObj.cords[1]+startObj.cords[1])/2), resultArr, 12, 'no');



}
