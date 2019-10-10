import { loadImageFromUrl, loadImagesFromUrls } from "./imageCacheManager";
const img = 'https://ss0.baidu.com/73x1bjeh1BF3odCf/it/u=2057907955,1583363359&fm=85&s=EF26CD4EC6052B5D8BA9103303001012';
describe.skip('imageCacheManager', () => {
    it('loadImageFromUrl', async () => {
        const p = await loadImageFromUrl(img);
        expect(p).toBeDefined();
    });
    it.skip('loadImagesFromUrls', async () => {
        const ps = await loadImagesFromUrls([img,img]);
        expect(ps).toBeDefined();
    });
});