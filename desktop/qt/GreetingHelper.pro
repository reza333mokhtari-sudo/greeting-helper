QT += core gui widgets webenginewidgets

CONFIG += c++17

SOURCES += main.cpp

TARGET = GreetingHelper
TEMPLATE = app

# Performance optimizations for WebEngine
DEFINES += QT_NO_KEYWORDS

# Windows Icon
# RC_ICONS = app_icon.ico

# Deployment
target.path = $$[QT_INSTALL_BINS]
INSTALLS += target
