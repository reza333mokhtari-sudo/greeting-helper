#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QtWebEngineQuick/qtwebenginequickglobal.h>
#include "src/core/Document.h"
#include "src/canvas/MapCanvasItem.h"
#include "src/models/AssetLibraryModel.h"
#include "src/services/AiClient.h"
#include "src/services/FileService.h"

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

int main(int argc, char *argv[])
{
    QtWebEngineQuick::initialize();
    
    QGuiApplication app(argc, argv);
    app.setApplicationName("GreetingHelper");
    app.setOrganizationName("DungeonScrawl");

    qmlRegisterType<Document>("DungeonEditor.Core", 1, 0, "Document");
    qmlRegisterType<MapCanvasItem>("DungeonEditor.Canvas", 1, 0, "MapCanvasItem");
    qmlRegisterType<AssetLibraryModel>("DungeonEditor.Models", 1, 0, "AssetLibraryModel");
    qmlRegisterType<AiClient>("DungeonEditor.Services", 1, 0, "AiClient");
    qmlRegisterType<FileService>("DungeonEditor.Services", 1, 0, "FileService");

    QQmlApplicationEngine engine;
    
    Document* doc = new Document(&engine);
    engine.rootContext()->setContextProperty("mapDocument", doc);

    AssetLibraryModel* assetModel = new AssetLibraryModel(&engine);
    assetModel->loadManifest(":/DungeonEditor/assets/soulslike/manifest.json");
    engine.rootContext()->setContextProperty("assetModel", assetModel);

    AiClient* aiClient = new AiClient(&engine);
    engine.rootContext()->setContextProperty("aiClient", aiClient);

    FileService* fileService = new FileService(&engine);
    engine.rootContext()->setContextProperty("fileService", fileService);

    const QUrl url(u"qrc:/DungeonEditor/qml/Main.qml"_qs);
    QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                     &app, [url](QObject *obj, const QUrl &objUrl) {
        if (!obj && url == objUrl)
            QCoreApplication::exit(-1);
    }, Qt::QueuedConnection);
    engine.load(url);

    return app.exec();
}



