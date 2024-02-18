import { useEffect, useState } from "react";

import config from './../config';

export default function SoknName(props) {
	const [ soknName, setSoknName ] = useState(null);

	useEffect(() => {
		if (!soknName) {
			fetch(config.apiUrl+'/soknir/'+props.soknId)
				.then(res => res.json())
				.then(json => setSoknName(json.soknarnafn))
				.catch((error) => {
				});

		}
	})

	return <>{ soknName || '' }</>
}