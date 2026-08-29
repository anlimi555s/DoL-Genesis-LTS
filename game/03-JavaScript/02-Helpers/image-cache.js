const ImageCache = (() => {
	const cacheEntries = new Map();

	function getOrCreate(src) {
		if (!src) {
			throw new Error("ImageCache: src must be a non empty string.");
		}

		const existing = cacheEntries.get(src);
		if (existing) {
			return existing.promise;
		}

		const image = new Image();
		let resolvePromise;
		let rejectPromise;
		const promise = new Promise((resolve, reject) => {
			resolvePromise = resolve;
			rejectPromise = reject;
		});

		const cacheEntry = { image, promise };
		cacheEntries.set(src, cacheEntry);

		image.onload = () => resolvePromise(image);
		image.onerror = () => {
			cacheEntries.delete(src);
			rejectPromise(new Error(`Could not load image at path ${src}`));
		};
		image.src = src;

		return cacheEntry.promise;
	}

	return {
		getOrCreate,
	};
})();

window.ImageCache = ImageCache;
