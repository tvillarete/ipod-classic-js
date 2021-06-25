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
        maxWidth: 375,
        maxHeight: 589,
        transparent: true,
        x: width ,
        y: height,
        dragable: true,
        resizable: false,
        frame: true,
        useContentSize: true
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
            label: 'Zoom',
            id: 'zoom',
            submenu: [{
                label: 'Small',
                type: "radio",
                click: () => {
                    windowSpecifications.height = 584 - (584 * 0.66);
                    windowSpecifications.width = 370 - (370 * 0.66);
                    windowSpecifications.ratio = 0.33;
                    _openNewWindow();
                }
            }, {
                label: 'Medium',
                type: "radio",
                click: () => {
                    windowSpecifications.height = 584 - (584 * 0.33);
                    windowSpecifications.width = 370 - (370 * 0.33);
                    windowSpecifications.ratio = 0.66;
                    _openNewWindow();
                },
                checked: true
            }, {
                label: 'Large',
                click: () => {
                    windowSpecifications.height = 584 * 1;
                    windowSpecifications.width = 370 * 1;
                    windowSpecifications.ratio = 1;
                    _openNewWindow();
                },
                type: "radio"
            }]
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
    const closeWindow = () => ipodWindow.close();
    const openWindow = (width, height, ratio) => {
        let _window = createWindow(width, height, ratio);
        ipodWindow = _window;
    }

    //Create the components of Electron UI
    let ipodWindow = createWindow(600 * 0.66, 410 * 0.66, 0.66);
    let tray = createTray(openWindow, closeWindow, () => ipodWindow);

    /* In case all windows will close, we block. App will be exit in Tray menu (Quit)*/
    app.on('window-all-closed', (e) => {
        e.preventDefault();
    });
};

// In case Linux programs we need disabled this this for trasnparency
if (process.platform === "linux") {
    app.commandLine.appendSwitch('enable-transparent-visuals');
    app.commandLine.appendSwitch('disable-gpu');
    app.disableHardwareAcceleration();
}

// When electron app is ready main function will be invoked
app.whenReady().then(main);
