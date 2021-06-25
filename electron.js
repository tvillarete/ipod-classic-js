// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray, screen } = require('electron')
const path = require('path')

const createWindow = (_width, _height, ratio) => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const factor = screen.getPrimaryDisplay().scaleFactor;

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: _width,
        height: _height,
        maxWidth: 400,
        maxHeight: 600,
        transparent: true,
        x: width,
        y: 0,
        dragable: true,
        resizable: false,
        frame: false,
        useContentSize: true,
        show: false,
        webPreferences: {
            zoomFactor: ratio
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'build/index.html'));
    return mainWindow;
}

/**
 * Create the menu for taskbar of SO
 * @param {*} openNewWindow 
 * @param {*} closeWindow 
 * @returns 
 */
const createTray = (openNewWindow, closeWindow) => {
    let tray = new Tray('/home/raulgf/Desktop/ipod-classic-js/build/favicon-32x32.png')
    let contextMenu = null;
    let windowSpecifications = { open: true, width: 370, height: 584, ratio: 1 };
    const _openNewWindow = () => {
        if (windowSpecifications.open)
            closeWindow();

        openNewWindow(windowSpecifications.width, windowSpecifications.height, windowSpecifications.ratio);
        contextMenu.getMenuItemById("open").enabled = false;
        contextMenu.getMenuItemById("close").enabled = true;
        windowSpecifications.open = true;
        tray.setContextMenu(contextMenu);
    };

    contextMenu = Menu.buildFromTemplate([
        {
            id: 'open',
            label: 'Open Window',
            enabled: false,
            click: _openNewWindow
        },
        {
            id: 'close',
            label: 'Close Window',
            enabled: windowSpecifications.open,
            click: () => {
                closeWindow();
                contextMenu.getMenuItemById("open").enabled = true;
                contextMenu.getMenuItemById("close").enabled = false;
                windowSpecifications.open = false;
                tray.setContextMenu(contextMenu);
            }
        },
        {
            label: 'About'
        },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() },

    ]);
    tray.setContextMenu(contextMenu);
    return tray;
};

/**
 * Principal Function will be invoked when Electron App is on
 */
const main = () => {
    /* In case all windows will close, we block. App will be exit in Tray menu (Quit)*/
    app.on('window-all-closed', (e) => {
        e.preventDefault();
    });

    const closeWindow = () => ipodWindow.close();
    const openWindow = (width, height, ratio) => {
        let _window = createWindow(width, height, ratio);
        _window.show();
        ipodWindow = _window;
    }

    //Create the components of Electron UI
    let ipodWindow = createWindow(400, 650, 0.66);
    setTimeout(() => ipodWindow.show(), 400);
    let tray = createTray(openWindow, closeWindow, () => ipodWindow);

};

// In case Linux programs we need disabled this this for trasnparency
if (process.platform === "linux") {
    app.commandLine.appendSwitch('enable-transparent-visuals');
    app.commandLine.appendSwitch('disable-gpu');
    app.disableHardwareAcceleration();
}

// When electron app is ready main function will be invoked
app.whenReady().then(main);
