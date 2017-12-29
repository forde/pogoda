import React, { Component } from 'react';
import styled from 'styled-components';
import axios from 'axios';



class Map extends Component {

    constructor(props) {
        super(props);
        this.state = {
            markers: [],
        };
    }

    componentDidMount() {
        this._loadMapScript.bind(this)();
    }

    componentWillReceiveProps(newProps) {
        const directions = newProps.directions;
        this._showDirections(directions);
    }

    _loadMapScript() {
        window.initMap = this._initMap.bind(this);
        const apiKey = 'AIzaSyAEFAVXsJzMdYNN1qLTMgDqDWnhBnpwSeY';
        const src = 'https://maps.googleapis.com/maps/api/js?key='+apiKey+'&callback=initMap';
        const ref = window.document.getElementsByTagName("script")[0];
        const script = window.document.createElement("script");
        script.src = src;
        script.async = true;
        ref.parentNode.insertBefore(script, ref);
    }
    
    _initMap() {
        const google = window.google;

        require('./../epoly');

        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers:true, suppressPolylines: true});
        //this.infoWindow = new google.maps.InfoWindow();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                this.map = new google.maps.Map(document.getElementById('map') , {
                    center: pos,
                    zoom: 12,
                    draggable: true,
                });
                                
            }, () => {
              //handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            //bowser does not support geolocation
        }
    }

    _showDirections(directions) { 
        this._removeAllMarkers();
        
        this.directionsDisplay.setMap(this.map);
        this.directionsService.route({
            origin: directions.from,
            destination: directions.to,
            travelMode: 'DRIVING',
            drivingOptions: {
                departureTime: new Date(), // for the time N milliseconds from now.
                trafficModel: 'bestguess' // pessimistic | optimistic
            }
        }, (response, status) => {
            console.log(response, status);
            if (status === 'OK') {

                this._drawRoutePath(response);
                this._renderRouteMidpoints(response);

            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }

    _removeAllMarkers() {
        this.state.markers.map(marker => {
            marker.setMap(null);
        });
        this.setState({markers: []});
    }
    

    _drawRoutePath(response) {
        const google = window.google;
        if(this.polyline) this.polyline.setMap(null);

        this.polyline = new google.maps.Polyline({
            path: [],
            strokeColor: '#316DC0',
            strokeOpacity: .6,
            strokeWeight: 6
        });

        google.maps.event.addListener(this.polyline, 'click', e => {
            console.log(e);
        });
        
        this.polyline.setPath([]);
        this.directionsDisplay.setDirections(response);

        const bounds = new google.maps.LatLngBounds();
        const legs = response.routes[0].legs;
        for (let i=0; i<legs.length; i++) {
            const steps = legs[i].steps;

            for (let j=0;j<steps.length;j++) {
                const nextSegment = steps[j].path;

                for (let k=0;k<nextSegment.length;k++) {

                    this.polyline.getPath().push(nextSegment[k]);
                    bounds.extend(nextSegment[k]);
                }
            }
        }

        this.polyline.setMap(this.map);
    }

    _renderRouteMidpoints(response) {
        const google = window.google;

        this.totalDist = 0;
        this.totalTime = 0;
        const route = response.routes[0];
        for (let i = 0; i < route.legs.length; i++) {
            this.totalDist += route.legs[i].distance.value;
            this.totalTime += route.legs[i].duration.value;      
        }
        
        [0, 50, 100].map(perc => {
            const latLng = this._positionFromRoutePercentage(perc);
            
            const icon = {
                url: require('./../img/c.svg'),
                anchor: new google.maps.Point(10,10),
                scaledSize: new google.maps.Size(20,20)
            };
            const infoWindowContent = 'sprawdzam pogodę ...';
            const marker = this._createMarker(latLng, icon, infoWindowContent, true);

            axios.get('http://pogoda.local/test.php?lat='+latLng.lat()+'&lng='+latLng.lng())
                .then(res => {
                    console.log(res);
                    if(res.data.product) {
                        const times = res.data.product.time;
                        const iconUrl = 'http://api.met.no/weatherapi/weathericon/1.1/?symbol='+times[1].location.symbol['@attributes'].number+';content_type=image/png';
                        //cloudiness['@attributes'].percent
                        //fog['@attributes'].percent
                        //humidity['@attributes'].value
                        //pressure['@attributes'].value && unit
                        //windSpeed['@attributes'].mps
                        marker.infoWindowContent = '\
                            <div class="iw">\
                                <img class="iw-icon" src="'+iconUrl+'" alt="icon" />\
                                <span class="iw-temp">'+times[0].location.temperature['@attributes'].value+' &#8451;</span>\
                                <div class="iw-clouds">Zachmurzenie: <span>'+times[0].location.cloudiness['@attributes'].percent+' %<span></div>\
                                <div class="iw-wind">Wiatr: <span>'+times[0].location.windSpeed['@attributes'].mps+' mps<span></div>\
                                <div class="iw-fog">Mgła: <span>'+times[0].location.fog['@attributes'].percent+' %<span></div>\
                                <div class="iw-hum">Wilgotność: <span>'+times[0].location.humidity['@attributes'].value+' %<span></div>\
                                <div class="iw-pres">Ciśnienie: <span>'+times[0].location.pressure['@attributes'].value+' '+times[0].location.pressure['@attributes'].unit+'<span></div>\
                            </div>\
                        ';
                        marker.infoWindow.setContent(marker.infoWindowContent); 
                    }
                });
            
            return null;
        });
        
    }

    _positionFromRoutePercentage(percentage) {
        const distance = (percentage/100) * this.totalDist;
        //const time = ((percentage/100) * this.totalTime/60).toFixed(2);
        return this.polyline.GetPointAtDistance(distance);
    }
    
    _createMarker(position, icon, infoWindowContent, autoOpen) {
        const google = window.google;
        const marker = new google.maps.Marker({
            position: position,
            map: this.map,
            icon: icon,
            infoWindow: new google.maps.InfoWindow(),
            infoWindowContent: infoWindowContent,
        });

        google.maps.event.addListener(marker, 'click', () => {
            marker.infoWindow.setContent(marker.infoWindowContent); 
            marker.infoWindow.open(this.map, marker);
        });

        if(autoOpen) {
            marker.infoWindow.setContent(marker.infoWindowContent); 
            marker.infoWindow.open(this.map, marker);
        }

        this.setState({
            markers: [...this.state.markers, marker]
        });

        return marker;
    }

    /*_processRoute(route) {
        const legs = route.routes[0].legs[0];
        //console.log(legs);

        const spread = 10000;
        let spreadDist = 0;
        const spreadPoints = legs.steps.reduce((acc, step, i) => {
            spreadDist += step.distance.value;
            if(i === 0 || i === legs.steps.length-1) return [...acc, step];
            if(spreadDist > spread * (acc.length-1)) return [...acc, step];
            return acc;
        },[]);
        //console.log(spreadPoints);

        const google = window.google;
        for (let i = 0; i < spreadPoints.length; i++) {
            let marker = new google.maps.Marker;
            marker.setMap(this.map);
            marker.setPosition(spreadPoints[i].start_location);
            
            const lat = spreadPoints[i].start_location.lat();
            const lng = spreadPoints[i].start_location.lng();
            
            axios.get('http://pogoda.local/test.php?lat='+lat+'&lng='+lng)
                .then(res => {
                    console.log(res);
                    if(res.data.product) {
                        const forecast = res.data.product.time[0];
                        console.log(forecast);

                        google.maps.event.addListener(marker, 'click', () => {
                            this.infoWindow.setContent(forecast.location.temperature['@attributes'].value);
                            this.infoWindow.open(this.map, marker);
                        });

                    }
                });
        }
    }*/

    render() {
        return(
            <MapContainer id="map">
                <span>Loading map based on your current location</span>
            </MapContainer>
        );
    }
}

export default Map;

const MapContainer = styled.div`
    position: absolute!important;
    width: 100%;
    height: 100%;
    top:0;
    left:0;
    display: flex;
    align-items: center;
    justify-content:center;
    flex-direction: column;
`;