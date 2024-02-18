import { useEffect, useState } from "react";

import config from './../config';

export default function HreppurName(props) {
	const [ hreppurName, setHreppurName ] = useState(null);

	useEffect(() => {
		if (!hreppurName) {
			fetch(config.apiUrl+'/hreppar/'+props.hreppurId)
				.then(res => res.json())
				.then(json => setHreppurName(json.nafn))
				.catch((error) => {
				});
		}
	})

	return <>{ hreppurName || '' }</>
}