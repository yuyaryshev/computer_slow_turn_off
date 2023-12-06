#include "stdafx.h"

#define _WIN32_WINNT 0x500

#include <windows.h>
#include <tchar.h>
#include <CommCtrl.h>
#include <fstream>
#include <iostream>
#include "json.hpp"
#include <algorithm>

#include "settings.h"

using json = nlohmann::json;

Settings LoadSettings() {
    Settings settings;
    
    json settingsJson;

    // Try to open settings.json for reading
    std::ifstream settingsFile("settings.json");

    if (settingsFile.is_open()) {
        try {
            settingsFile >> settingsJson;
        }
        catch (const std::exception& e) {
            std::cerr << "Error parsing settings.json: " << e.what() << std::endl;
        }
    }
    else {
        // If settings.json doesn't exist, create it and write default values
        settingsJson["ScreenWidth"] = settings.ScreenWidth;
        settingsJson["ScreenHeight"] = settings.ScreenHeight;
        settingsJson["ShutdownDelay"] = settings.shutdownDelay;
        settingsJson["password"] = settings.password;
        settingsJson["remove_this_setting"] = 1;

        std::ofstream outFile("settings.json");
        if (outFile.is_open()) {
            outFile << settingsJson.dump(4); // dump with indentation for readability
            outFile.close();
        }
        else {
            std::cerr << "Failed to create settings.json" << std::endl;
        }
    }

    // Retrieve constants from settings.json
    settings.ScreenWidth = settingsJson.value("ScreenWidth", 1920);
    settings.ScreenHeight = settingsJson.value("ScreenHeight", 1080);
    settings.shutdownDelay = settingsJson.value("ShutdownDelay", 0.001);
    settings.password = settingsJson.value("password", "stop");
    settings.doShutdown = !!settingsJson.value("shutdown", 1);
    settings.removeThisSetting = settingsJson.value("remove_this_setting", 0);
    return settings;
}