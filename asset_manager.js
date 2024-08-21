class AssetManager {
    constructor() {
        this.assets = {};
        this.awaiting = 0;
    }

    get(fileName) {
        return this.assets[fileName];
    }

    loadFile(filePath, fileName, callback) {
        this.awaiting += 1;
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${filePath}`);
                }
                return response.text();
            })
            .then(data => {
                this.assets[fileName] = data;
                this.awaiting -= 1;
                callback();
            })
            .catch(error => console.error(error));
    }

    doneLoading() {
        return this.awaiting === 0;
    }
}

export default AssetManager;