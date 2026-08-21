#include <QApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QIcon>
#include <QQuickStyle>
#include <QQuickWindow>
#include <QSettings>
#include <QtQml/qqml.h>
#include <QDebug>
#include <QLibrary>
#include <QSurfaceFormat>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

#ifdef Q_OS_WIN
#include <windows.h>
#endif

// We include the headers but the implementation is linked from core.dll
#include <core/Document.h>
#include <canvas/MapCanvasItem.h>
#include <models/AssetLibraryModel.h>
#include <services/AiClient.h>
#include <services/FileService.h>
#include <services/WorkspaceService.h>
#include <services/LicenseService.h>

int main(int argc, char *argv[])
{
    // Professional DCC initialization
    QApplication app(argc, argv);
    app.setOrganizationName("DungeonEditor");
    app.setApplicationName("DungeonEditorNative");
    app.setWindowIcon(QIcon(":/qt/qml/DungeonEditor/assets/icon.png"));

    // Force Fusion style for ZBrush/Maya aesthetic
    QQuickStyle::setStyle("Fusion");

    // Register types (Implementation resides in core library)
    qmlRegisterType<Document>("DungeonEditor.Core", 1, 0, "Document");
    qmlRegisterType<MapCanvasItem>("DungeonEditor.Canvas", 1, 0, "MapCanvasItem");
    qmlRegisterType<AssetLibraryModel>("DungeonEditor.Models", 1, 0, "AssetLibraryModel");
    qmlRegisterType<WorkspaceService>("DungeonEditor.Services", 1, 0, "WorkspaceService");
    qmlRegisterType<AiClient>("DungeonEditor.Services", 1, 0, "AiClient");
    qmlRegisterType<LicenseService>("DungeonEditor.Services", 1, 0, "LicenseService");
    qmlRegisterType<FileService>("DungeonEditor.Services", 1, 0, "FileService");

    QQmlApplicationEngine engine;
    
    // Internal resource paths for bundled QML
    engine.addImportPath("qrc:/qt/qml");
    engine.addImportPath("qrc:/");

    const QUrl url("qrc:/qt/qml/DungeonEditor/qml/Main.qml");
    QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                     &app, [url](QObject *obj, const QUrl &objUrl) {
        if (!obj && url == objUrl)
            QCoreApplication::exit(-1);
    }, Qt::DirectConnection);
    
    engine.load(url);

    return app.exec();
}
