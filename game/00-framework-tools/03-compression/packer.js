/*
	Packs a weather snapshot for the Start page by saving only the next two keypoints for weather, fog,
	and overcast. On the start page, unpack restores those keypoints and stores them back in the weatherObj,
	allowing us to treat start page weather in the same way as we treat weather throughout the rest of the game.
*/
const Packer = (() => {
	function packWeatherData() {
		const nowTimestamp = Time.date?.timeStamp ?? 0;
		const payload = {
			snow: V.weatherObj.snow,
			previousWeatherIndex: V.weatherObj.previousWeatherIndex,
			weatherKeypoints: packKeypointsPair(V.weatherObj.keypointsArr, nowTimestamp, "value"),
			fogKeypoints: packKeypointsPair(V.weatherObj.fogKeypoints, nowTimestamp, "fogGoal"),
		};

		return btoa(JSON.stringify(payload));
	}

	function unpackWeatherData(packedData) {
		const payload = tryDecodeJsonPayload(packedData);
		if (payload) {
			applyWeatherPayload(payload);
			return;
		}

		applyLegacyWeatherPayload(packedData);
	}

	function tryDecodeJsonPayload(packedData) {
		try {
			const decoded = atob(packedData);
			const s = decoded.trim();
			if (!(s.startsWith("{") || s.startsWith("["))) {
				return null;
			} else {
				return JSON.parse(s);
			}
		} catch (e) {
			return null;
		}
	}

	function applyWeatherPayload(payload) {
		V.weatherObj.snow = payload.snow ?? 0;

		T.baseTemperature = V.weatherObj.snow > 15 ? -20 : 20;

		V.weatherObj.previousWeatherIndex = payload.previousWeatherIndex ?? payload.weatherIndex ?? 0;

		if (payload.weatherKeypoints?.length) {
			V.weatherObj.keypointsArr = payload.weatherKeypoints.map(keyPoint => ({
				timestamp: keyPoint.timestamp,
				value: keyPoint.value ?? 0,
			}));
		} else {
			V.weatherObj.keypointsArr = [];
		}

		if (payload.fogKeypoints?.length) {
			V.weatherObj.fogKeypoints = payload.fogKeypoints.map(keyPoint => ({
				timestamp: keyPoint.timestamp,
				fogGoal: keyPoint.fogGoal ?? 0,
			}));
		} else {
			V.weatherObj.fogKeypoints = [];
		}
	}

	function applyLegacyWeatherPayload(packedData) {
		packedData = parseInt(packedData, 36).toString(10).padStart(11, "0"); // Ensure the string is zero-padded to 11 digits

		const snow = parseInt(packedData.slice(-6, -3), 10);

		V.weatherObj.snow = snow;
		T.baseTemperature = snow > 15 ? -20 : 20;

		V.weatherObj.keypointsArr = [];
		V.weatherObj.fogKeypoints = [];
	}

	function packKeypointsPair(keypoints, nowTimestamp, valueKey) {
		if (!keypoints?.length) return [];

		let current;
		let next;

		for (const keyPoint of keypoints) {
			if (keyPoint.timestamp <= nowTimestamp) {
				current = keyPoint;
			}

			if (keyPoint.timestamp > nowTimestamp && !next) {
				next = keyPoint;
			}
		}

		// Fallback if something happens and the earliest keypoint is after the current time. I've found that this can happen at the very start of the game.
		if (!current || !next) return [];

		const currentValue = current?.[valueKey];
		const nextValue = next?.[valueKey] ?? currentValue;

		return [
			{ timestamp: current.timestamp, [valueKey]: currentValue },
			{ timestamp: next.timestamp, [valueKey]: nextValue },
		];
	}

	return {
		packWeatherData,
		unpackWeatherData,
	};
})();
window.Packer = Packer;
