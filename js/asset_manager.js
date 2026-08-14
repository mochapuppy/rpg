class AssetManager {
    constructor() {
        this.assets = {};
        this.awaiting = 0;
    }

    get(fileName) {
        return this.assets[fileName];
    }

    loadFile(filePath, fileName, callback = () => {}) {
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
            .catch(error => {
                this.awaiting -= 1;
                console.error(error);
            });
    }

    // Load several text assets (including several CSV map layers) and call
    // callback once after all of them have finished loading.
    loadFiles(files, callback = () => {}) {
        if (files.length === 0) {
            callback();
            return;
        }

        let remaining = files.length;

        const onFileLoaded = () => {
            remaining -= 1;
            if (remaining === 0) {
                callback();
            }
        };

        for (const file of files) {
            this.loadFile(file.path, file.name, onFileLoaded);
        }
    }

    // Convert a previously loaded CSV text asset into a numeric 2D array.
    getCSV(fileName) {
        const csv = this.get(fileName);

        if (typeof csv !== "string") {
            throw new Error(`CSV asset '${fileName}' has not been loaded.`);
        }

        return csv
            .trim()
            .split(/\r?\n/)
            .map(row => row.split(",").map(Number));
    }

    doneLoading() {
        return this.awaiting === 0;
    }
}

export default AssetManager;
