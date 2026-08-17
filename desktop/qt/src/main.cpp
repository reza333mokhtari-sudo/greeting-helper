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
    qmlRegisterType<WorkspaceService>("DungeonEditor.Services", 1, 0, "WorkspaceService");
    qmlRegisterType<AiClient>("DungeonEditor.Services", 1, 0, "AiClient");
    qmlRegisterType<FileService>("DungeonEditor.Services", 1, 0, "FileService");

    
    // Icon path updated for Qt 6 resource prefix
    app.setWindowIcon(QIcon(":/qt/qml/DungeonEditor/assets/icon.png"));

    QQmlApplicationEngine engine;
    
    // Register "components" relative to the resource root
    // We try both the standardized Qt 6 module path and a flat resource path
    engine.addImportPath("qrc:/qt/qml/DungeonEditor");
    engine.addImportPath("qrc:/DungeonEditor");
    engine.addImportPath("qrc:/");
    
    // Path list for Main.qml discovery
    const QStringList resourcePaths = {
        "qrc:/qt/qml/DungeonEditor/qml/Main.qml",
        "qrc:/DungeonEditor/qml/Main.qml",
        "qrc:/qml/Main.qml"
    };

    bool loaded = false;
    
    // Fallback: If QRC fails, try local file system discovery for development
    QString executablePath = QCoreApplication::applicationDirPath();
    QString localMain = executablePath + "/qml/Main.qml";
    
    for (const QString &path : resourcePaths) {
        const QUrl url(path);
        
        // Connect to report specific component errors
        QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                         &app, [url](QObject *obj, const QUrl &objUrl) {
            if (!obj && url == objUrl) {
                qCritical() << "Engine failed to create object from:" << objUrl;
            }
        }, Qt::DirectConnection);
        
        engine.load(url);
        if (!engine.rootObjects().isEmpty()) {
            loaded = true;
            qDebug() << "Successfully loaded Main.qml from resource path:" << path;
            break;
        }
    }

    if (!loaded) {
        qDebug() << "Resource paths exhausted. Attempting direct URL fallback...";
        // Direct URL fallback - try common relative paths from executable
        QList<QUrl> fallbackUrls = {
            QUrl::fromLocalFile(localMain),
            QUrl::fromLocalFile(executablePath + "/../qml/Main.qml"),
            QUrl::fromLocalFile(executablePath + "/../../qml/Main.qml")
        };
        
        for (const QUrl &url : fallbackUrls) {
            engine.load(url);
            if (!engine.rootObjects().isEmpty()) {
                loaded = true;
                qDebug() << "Successfully loaded Main.qml from direct URL:" << url.toLocalFile();
                break;
            }
        }
    }

    if (!loaded) {
        qCritical() << "Critical: Could not find or load Main.qml in any resource or direct path.";
        return -1;
    }
    
    if (engine.rootObjects().isEmpty()) {
        qCritical() << "Critical: Engine root objects list is empty after load attempt.";
        return -1;
    }

    return app.exec();
}
