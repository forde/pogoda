import React, { Component } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import moment from 'moment';

import BarLoader from './BarLoader';


class Map extends Component {

    constructor(props) {
        super(props);
        this.state = {
            markers: [],
        };
        this.domain = 'http://pogoda.forde.pl';
    }

    componentDidMount() {
        this._loadMapScript.bind(this)();
    }

    componentWillReceiveProps(newProps) {
        const { directions, departureDate } = newProps;
        if(directions) {
            this._showDirections(directions, departureDate);
        }
    }

    _loadMapScript() {
        window.googleMapsInitCallback = this._googleMapsInitCallback.bind(this);
        const apiKey = 'AIzaSyAEFAVXsJzMdYNN1qLTMgDqDWnhBnpwSeY';
        const src = 'https://maps.googleapis.com/maps/api/js?key='+apiKey+'&callback=googleMapsInitCallback&libraries=places';
        const ref = window.document.getElementsByTagName("script")[0];
        const script = window.document.createElement("script");
        script.src = src;
        script.async = true;
        ref.parentNode.insertBefore(script, ref);
    }
    
    _googleMapsInitCallback() {
        const google = window.google;

        require('./../epoly');

        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers:true, suppressPolylines: true});

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                this._initMap(pos, 12);
            }, () => {
              //handleLocationError(true, infoWindow, map.getCenter());
              this._initMap();
            });
        } else {
            //bowser does not support geolocation
            this._initMap();
        }
    }

    _initMap(pos = {lat: 52.4580841, lng: 19.4169861}, zoom = 6) {
        const google = window.google;

        this.map = new google.maps.Map(document.getElementById('map') , {
            center: pos,
            zoom: zoom,
            draggable: true,
        });

        if(this.props.onMapReady) this.props.onMapReady(); 
    }

    _showDirections(directions, date) { 
        this._removeAllMarkers();

        const departure = date ? moment(date, 'DD-MM-YYYY').toDate() : new Date();

        this.directionsDisplay.setMap(this.map);
        this.directionsService.route({
            origin: directions.from,
            destination: directions.to,
            travelMode: 'DRIVING',
            drivingOptions: {
                departureTime: departure,
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

            axios.get(this.domain+'/api/weather/index.php?lat='+latLng.lat()+'&lng='+latLng.lng())
                .then(res => {
                    console.log(res);
                    if(res.data.product) {
                        const times = res.data.product.time;

                        if(this.props.departureDate && this.props.departureDate !== moment().format('DD-MM-YYYY')) {
                            const futureForecast = times.reduce((acc, item) => {
                                console.log(item['@attributes'].from)
                            }, '')
                        }

                        const iconUrl = 'http://api.met.no/weatherapi/weathericon/1.1/?symbol='+times[1].location.symbol['@attributes'].number+';content_type=image/png';
                        const windSpeed = (Number(times[0].location.windSpeed['@attributes'].mps) * 3.6).toFixed(1);
                        marker.infoWindowContent = '\
                            <div class="iw">\
                                <img class="iw-icon" src="'+iconUrl+'" alt="icon" />\
                                <span class="iw-temp">'+times[0].location.temperature['@attributes'].value+' &#8451;</span>\
                                <div class="iw-clouds">Zachmurzenie: <span>'+times[0].location.cloudiness['@attributes'].percent+' %<span></div>\
                                <div class="iw-wind">Wiatr: <span>'+windSpeed+' km/h<span></div>\
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

    render() {
        return(
            <MapContainer id="map">
                <Loader>
                    <p>Sprawdzam lokalizację</p>
                    <BarLoader />
                </Loader>
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

const Loader = styled.div`
    background:#fff;
    max-width:90%;
    min-width: 320px;
    position:relative;
    text-align:center;
    p {
        margin-bottom: 20px;
        font-weight: 300;
        -webkit-font-smoothing: antialiased;
        font-size: 20px;
    }
`