export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img: HTMLImageElement = new Image();
        img.onload = () => resolve(img);
        img.onerror = err => reject(err);
        img.src = url;
    });
}

export function loadImagesFromUrls(urls: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(urls.map(url => loadImageFromUrl(url)));
}