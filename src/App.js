import React, { useState, useEffect } from 'react';
import { HashRouter, useLocation } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, WMSTileLayer, LayersControl, LayerGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet';

import './App.css';
import 'leaflet/dist/leaflet.css'

import SoknName from './components/SoknName';

import config from './config';
import HreppurName from './components/HreppurName';
import { useRef } from 'react';

const { BaseLayer, Overlay } = LayersControl;

function EventProvider(props) {
	const map = useMapEvents({
		zoomend(event) {
			if (props.onZoom) {
				props.onZoom(event)
			}
		},
		moveend(event) {
			if (props.onMove) {
				props.onMove(event)
			}
		}
	})
}

function Location(props) {
	const location = useLocation();

	useEffect(() => {
		let params = {}

		location.search.replace('?', '').split('&').forEach(item => {
			params[item.split('=')[0]] = item.split('=')[1];
		});

		if (props.onLocation) {
			props.onLocation(params);
		}
	}, [location])
}

function App() {
	const [mapData, setMapData] = useState(null);

	const history = createBrowserHistory();

	const map = useRef();

	const defaultIcon = new L.icon({
		iconUrl: '/img/marker-icon.png',
		shadowUrl: '/img/marker-shadow.png',
		popupAnchor: [13, 15]
	});

	useEffect(() => {
		if (!mapData) {
			//fetch('dummy/geo_allt.json') 
			fetch(config.apiUrl+'/baeir/geo/?allt=1') 
				.then(res => res.json())
//				.then(json => setMapData([json.results[0]]))
				.then(json => setMapData(json.results))
		}
	});

	return (
		<HashRouter history={history}>

			<Location onLocation={(event) => {
				setTimeout(() => {
					if (map.current && (event.lat || event.lng || event.zoom) && (map.current.getZoom() != event.zoom || map.current.getCenter().lat != event.lat || map.current.getCenter().lng != event.lng)) {
						map.current.setView([event.lat, event.lng], event.zoom, { animate: false });
					}
				}, 500);
			}} />
			
			<MapContainer ref={map} zoomend={(event) => console.log(event)} center={[64.963051, -19.020836]} minZoom={7} maxZoom={12} zoom={7} scrollWheelZoom={true}>

				<EventProvider onMove={(event) => {
					history.push('#?zoom='+event.target.getZoom()+'&lat='+event.target.getCenter().lat+'&lng='+event.target.getCenter().lng)
				}} />

				<LayersControl hideSingleBase={true} collapsed={false} position="topright">

					<BaseLayer checked name="Landmælingar Íslands">
						<LayerGroup>
							<WMSTileLayer
								url="https://gis.lmi.is/mapcache/web-mercator?"
								layers="LMI_Kort"
								format="image/png"
								attribution="Landmælingar Íslands"
								transparent="true"
							/>
							<WMSTileLayer
									url="https://gis.lmi.is/geoserver/wms?"
									layers="Ornefni_an_mannvirkja"
									format="image/png"
									attribution="Landmælingar Íslands"
									transparent="true"
								/>
						</LayerGroup>
					</BaseLayer>

					<BaseLayer name="Eggaldin">
						<LayerGroup>
							<TileLayer
								attribution="Landmælingar Íslands/Náttúrufræðistofnun Íslands/Trausti Dagsson"
								url="https://nafnid.is/gis/island-tiles/{z}/{x}/{y}.png"
							/>
							<TileLayer
								attribution="Landmælingar Íslands/Náttúrufræðistofnun Íslands/Trausti Dagsson"
								url="https://nafnid.is/gis/island-vegir-tiles/{z}/{x}/{y}.png"
							/>
						</LayerGroup>
					</BaseLayer>

					<Overlay checked name="Örnefni LMÍ">
					</Overlay>


				</LayersControl>

				<MarkerClusterGroup>
					{
						mapData && mapData.map((item, index) => <Marker key={index}
								position={[item.breidd, item.lengd]}
								title={item.nafn}
								icon={defaultIcon}
							>
								<Popup>
									<div className="text-lg font-bold mb-2">{item.nafn}</div>
									<div className="text-md">
										{
											item.soknir.length > 0 && <div className="mb-2">
												<span className="font-bold">Sókn: </span>
												<SoknName soknId={item.soknir[0]} />
											</div>
										}
										{
											item.hreppar.length > 0 && <div className="mb-2">
												<span className="font-bold">Hreppur: </span>
												<HreppurName hreppurId={item.hreppar[0]} />
											</div>
										}
										<a href={'https://smb.adlib.is/baer/'+item.id}>Nánar</a>										
									</div>
								</Popup>
							</Marker>
						)
					}
				</MarkerClusterGroup>
			</MapContainer>
		</HashRouter>
	);
}

export default App;
