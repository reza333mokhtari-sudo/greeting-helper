#include <QApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QIcon>
#include <QtQml/qqml.h>
#include <QDebug>


#include <core/Document.h>
#include <canvas/MapCanvasItem.h>
#include <models/AssetLibraryModel.h>
#include <services/AiClient.h>
#include <services/FileService.h>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);
    app.setOrganizationName("DungeonEditor");
    app.setApplicationName("DungeonEditorNative");

    qmlRegisterType<Document>("DungeonEditor.Core", 1, 0, "Document");
    qmlRegisterType<MapCanvasItem>("DungeonEditor.Canvas", 1, 0, "MapCanvasItem");
    qmlRegisterType<AssetLibraryModel>("DungeonEditor.Models", 1, 0, "AssetLibraryModel");
    qmlRegisterType<AiClient>("DungeonEditor.Services", 1, 0, "AiClient");
    qmlRegisterType<FileService>("DungeonEditor.Services", 1, 0, "FileService");
    
    // Icon path updated for Qt 6 resource prefix
    app.setWindowIcon(QIcon(":/qt/qml/DungeonEditor/assets/icon.png"));

    QQmlApplicationEngine engine;
    
    // Register "components" relative to the resource root
    engine.addImportPath("qrc:/qt/qml/DungeonEditor");
    
    // Attempt multiple resource prefixes for robustness across build systems
    const QStringList resourcePaths = {
        "qrc:/qt/qml/DungeonEditor/qml/Main.qml",
        "qrc:/DungeonEditor/qml/Main.qml",
        "qrc:/qml/Main.qml"
    };

    bool loaded = false;
    for (const QString &path : resourcePaths) {
        const QUrl url(path);
        QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                         &app, [url](QObject *obj, const QUrl &objUrl) {
            if (!obj && url == objUrl) {
                qCritical() << "Failed to load QML component:" << objUrl;
            }
        }, Qt::DirectConnection);
        
        engine.load(url);
        if (!engine.rootObjects().isEmpty()) {
            loaded = true;
            break;
        }
    }

    if (!loaded) {
        qCritical() << "Critical: Could not find Main.qml in any resource path.";
        return -1;
    }
    if (engine.rootObjects().isEmpty())
        return -1;

    return app.exec();
}
